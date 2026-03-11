import * as path from 'path';

/**
 * パス区切りをスラッシュに正規化する
 * Markdown内で使用するため、OSに依存しない形式にする
 */
const normalizePath = (p: string): string => p.replace(/\\/g, '/');

/**
 * 数値をゼロ埋めする
 */
const pad = (n: number, len: number): string => String(n).padStart(len, '0');

/**
 * ミリ秒タイムスタンプ形式のファイル名を生成する
 * 形式: YYYYMMdd-HHmmss-SSS.png
 * 同名ファイルが存在する場合は -1, -2 ... と連番を付与
 */
export const generateFileName = (now: Date, existingFiles: string[]): string => {
  const base = [
    pad(now.getFullYear(), 4),
    pad(now.getMonth() + 1, 2),
    pad(now.getDate(), 2),
    '-',
    pad(now.getHours(), 2),
    pad(now.getMinutes(), 2),
    pad(now.getSeconds(), 2),
    '-',
    pad(now.getMilliseconds(), 3),
  ].join('');

  const ext = '.png';
  const candidate = `${base}${ext}`;

  if (!existingFiles.includes(candidate)) {
    return candidate;
  }

  // 衝突時は連番を付与
  let seq = 1;
  while (existingFiles.includes(`${base}-${seq}${ext}`)) {
    seq++;
  }
  return `${base}-${seq}${ext}`;
};

/**
 * 画像保存先ディレクトリを解決する
 * - relative: Markdownファイルと同じディレクトリ配下の folderName
 * - workspace: ワークスペースルート配下の folderName
 */
export const resolveImageDir = (
  mdFilePath: string,
  mode: 'relative' | 'workspace',
  folderName: string,
  workspaceRoot?: string,
): string => {
  if (mode === 'workspace') {
    if (!workspaceRoot) {
      throw new Error('workspace モードでは workspaceRoot が必要です');
    }
    return normalizePath(path.join(workspaceRoot, folderName));
  }

  // relative モード: Markdownファイルの親ディレクトリ + folderName
  const mdDir = path.dirname(mdFilePath);
  return normalizePath(path.join(mdDir, folderName));
};

/**
 * Markdownの画像リンクを生成する
 * 形式: ![altText](relativePath)
 */
export const buildMarkdownLink = (
  relativePath: string,
  altText: string,
): string => {
  const normalized = normalizePath(relativePath);
  return `![${altText}](${normalized})`;
};
