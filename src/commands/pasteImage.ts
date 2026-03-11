import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { getImageConfig } from '../config';
import { generateFileName, resolveImageDir, buildMarkdownLink } from '../services/imageService';

/** PowerShellコマンドを実行し、結果文字列を返す */
const runPowerShell = (command: string): string =>
  execSync(`powershell.exe -NoProfile -Command "${command}"`, {
    encoding: 'utf-8',
  }).trim();

/** クリップボードに画像が存在するか確認 */
export const hasClipboardImage = (): boolean => {
  const result = runPowerShell(
    "if (Get-Clipboard -Format Image) { Write-Output 'true' } else { Write-Output 'false' }",
  );
  return result === 'true';
};

/** クリップボード画像を指定パスに保存 */
const saveClipboardImage = (absolutePath: string): void => {
  runPowerShell(`(Get-Clipboard -Format Image).Save('${absolutePath}')`);
};

/** altTextMode に応じて altText を決定 */
const resolveAltText = async (
  mode: 'prompt' | 'empty' | 'filename',
  fileName: string,
): Promise<string | undefined> => {
  switch (mode) {
    case 'prompt': {
      const input = await vscode.window.showInputBox({
        prompt: '画像のaltテキストを入力',
        placeHolder: '説明テキスト',
      });
      // undefined = キャンセル → 処理中断のシグナル
      return input;
    }
    case 'empty':
      return '';
    case 'filename':
      // 拡張子を除いたファイル名を使用
      return path.parse(fileName).name;
  }
};

/** 画像貼り付けコマンド */
export const pasteImage = async () => {
  // 1. アクティブエディタがMarkdownか確認
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'markdown') {
    vscode.window.showWarningMessage('Markdownファイルを開いてください');
    return;
  }

  // 2. 設定を読み込み
  const config = getImageConfig();

  // 3-4. クリップボードに画像があるか確認
  if (!hasClipboardImage()) {
    vscode.window.showInformationMessage('クリップボードに画像がありません');
    return;
  }

  // 5. 保存先ディレクトリを解決
  const mdFilePath = editor.document.uri.fsPath;
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const imageDir = resolveImageDir(
    mdFilePath,
    config.saveLocationMode,
    config.saveFolder,
    workspaceRoot,
  );

  // 6. ディレクトリが存在しなければ作成
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // 7. ファイル名を生成（既存ファイル一覧を渡して衝突回避）
  const existingFiles = fs.readdirSync(imageDir);
  const fileName = generateFileName(new Date(), existingFiles);

  // 8. PowerShellで画像をファイルに保存
  const absolutePath = path.join(imageDir, fileName);
  saveClipboardImage(absolutePath);

  // 9. altText を決定
  const altText = await resolveAltText(config.altTextMode, fileName);
  if (altText === undefined) return; // キャンセル

  // 10. Markdownリンクを生成（Markdownファイルからの相対パス）
  const mdDir = path.dirname(mdFilePath);
  const relativePath = path.relative(mdDir, absolutePath).replace(/\\/g, '/');
  const markdownLink = buildMarkdownLink(relativePath, altText);

  // 11. エディタのカーソル位置にリンクを挿入
  await editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, markdownLink);
  });
};
