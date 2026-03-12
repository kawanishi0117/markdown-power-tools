import * as vscode from 'vscode';
import * as path from 'path';
import { getImageConfig } from '../config';
import { generateFileName, resolveImageDir, buildMarkdownLink } from '../services/imageService';

/** MIME から拡張子を決定する */
const mimeToExtension = (mime: string): string | undefined => {
  const map: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
  };
  return map[mime];
};

/** 対応する画像 MIME 一覧 */
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'] as const;

/** DataTransfer から画像ファイルを取得する */
const getImageFile = (
  dataTransfer: vscode.DataTransfer,
): { file: vscode.DataTransferFile; mime: string } | undefined => {
  // 明示的な画像 MIME を優先
  for (const mime of IMAGE_MIMES) {
    const item = dataTransfer.get(mime);
    const file = item?.asFile();
    if (file) return { file, mime };
  }
  return undefined;
};

/**
 * フェンスドコードブロック内かどうかを判定する
 * - CommonMark仕様: 行頭に0-3個のスペース + 3個以上の ` または ~
 * - 開始マーカーと同じ種類のマーカーでのみ閉じる（``` で開いたら ~~~ では閉じない）
 * - 閉じフェンスは情報文字列を持たない（マーカー + 空白のみ）
 */
const isInsideFencedCodeBlock = (document: vscode.TextDocument, position: vscode.Position): boolean => {
  let insideCodeBlock = false;
  let currentFenceMarker: '```' | '~~~' | null = null;

  for (let i = 0; i < position.line; i++) {
    const lineText = document.lineAt(i).text;

    // CommonMark仕様: 行頭に0-3個のスペース + 3個以上の ` または ~
    const fenceMatch = lineText.match(/^(\s{0,3})((`{3,})|(~{3,}))/);
    if (!fenceMatch) continue;

    const marker = fenceMatch[3] ? '```' : '~~~';

    if (!insideCodeBlock) {
      // コードブロック開始
      insideCodeBlock = true;
      currentFenceMarker = marker;
    } else if (marker === currentFenceMarker) {
      // 同じマーカーで閉じる — 閉じフェンスは情報文字列を持たない
      const afterMarker = lineText.slice(fenceMatch[0].length).trim();
      if (afterMarker.length === 0) {
        insideCodeBlock = false;
        currentFenceMarker = null;
      }
    }
  }

  return insideCodeBlock;
};

/** altTextMode に応じて挿入テキストを生成する */
const buildInsertText = (
  relativePath: string,
  altTextMode: 'prompt' | 'empty' | 'filename',
  fileName: string,
): string | vscode.SnippetString => {
  const escaped = relativePath.replace(/\\/g, '/');
  const link = buildMarkdownLink(escaped, '');

  switch (altTextMode) {
    case 'prompt': {
      // SnippetString で alt テキスト部分をプレースホルダにする
      const pathPart = link.match(/\]\((.+)\)$/)?.[1] ?? escaped;
      return new vscode.SnippetString(`![\${1:alt text}](${pathPart})$0`);
    }
    case 'empty':
      return link;
    case 'filename': {
      const alt = path.parse(fileName).name;
      return buildMarkdownLink(escaped, alt);
    }
  }
};

/** Document Paste API の provider */
export const createPasteImageProvider = (): vscode.DocumentPasteEditProvider => ({
  async provideDocumentPasteEdits(
    document: vscode.TextDocument,
    ranges: readonly vscode.Range[],
    dataTransfer: vscode.DataTransfer,
    _context: vscode.DocumentPasteEditContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.DocumentPasteEdit[] | undefined> {
    try {
      // file / untitled 以外のスキームは対象外
      if (!['file', 'untitled'].includes(document.uri.scheme)) {
        return undefined;
      }

      // コードブロック内なら通常 paste に任せる
      if (ranges.length > 0 && isInsideFencedCodeBlock(document, ranges[0].start)) {
        return undefined;
      }

      // クリップボードに画像がなければ通常 paste に任せる
      const imageData = getImageFile(dataTransfer);
      if (!imageData) {
        return undefined;
      }

      if (token.isCancellationRequested) return undefined;

      // 設定を読み込み
      const config = getImageConfig();

      // 保存先ディレクトリを解決
      const isUntitled = document.uri.scheme === 'untitled';
      const mdFilePath = isUntitled ? undefined : document.uri.fsPath;
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      // untitled かつワークスペースなしの場合は保存先を決められない
      if (!mdFilePath && !workspaceRoot) {
        return undefined;
      }

      const basePath = mdFilePath ?? workspaceRoot!;
      const imageDir = resolveImageDir(
        basePath,
        config.saveLocationMode,
        config.saveFolder,
        workspaceRoot,
      );

      // ファイル名を生成（拡張子は MIME から決定）
      const ext = mimeToExtension(imageData.mime) ?? '.png';

      // 保存先ディレクトリの既存ファイル一覧を取得（衝突回避のため）
      let existingFiles: string[] = [];
      try {
        const dirUri = vscode.Uri.file(imageDir);
        const entries = await vscode.workspace.fs.readDirectory(dirUri);
        existingFiles = entries
          .filter(([, type]) => type === vscode.FileType.File)
          .map(([name]) => name);
      } catch {
        // ディレクトリが存在しない場合は空配列のまま（新規作成される）
      }

      const fileName = generateFileName(new Date(), existingFiles, ext);
      const absolutePath = path.join(imageDir, fileName);
      const targetUri = vscode.Uri.file(absolutePath);

      // Markdown ファイルからの相対パス
      const mdDir = path.dirname(basePath);
      const relativePath = path.relative(mdDir, absolutePath);

      // 挿入テキストを生成
      const insertText = buildInsertText(relativePath, config.altTextMode, fileName);

      // DocumentPasteEdit を構築
      const pasteEdit = new vscode.DocumentPasteEdit(
        insertText,
        'Paste image as Markdown',
        new vscode.DocumentDropOrPasteEditKind('markdown.image'),
      );

      // WorkspaceEdit でファイル作成を積む
      const ws = new vscode.WorkspaceEdit();
      ws.createFile(targetUri, {
        contents: imageData.file,
        overwrite: false,
        ignoreIfExists: false,
      });
      pasteEdit.additionalEdit = ws;

      return [pasteEdit];
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      void vscode.window.showErrorMessage(`画像の貼り付け中にエラーが発生しました: ${message}`);
      return undefined;
    }
  },
});
