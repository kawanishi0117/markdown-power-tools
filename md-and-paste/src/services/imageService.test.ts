import { describe, it, expect } from 'vitest';
import { generateFileName, resolveImageDir, buildMarkdownLink } from './imageService';

describe('generateFileName', () => {
  it('ミリ秒タイムスタンプ形式 YYYYMMdd-HHmmss-SSS.png を生成する', () => {
    // 2024-03-15 09:05:30.123
    const date = new Date(2024, 2, 15, 9, 5, 30, 123);
    const result = generateFileName(date, []);
    expect(result).toBe('20240315-090530-123.png');
  });

  it('各桁がゼロ埋めされる', () => {
    // 2024-01-02 03:04:05.007
    const date = new Date(2024, 0, 2, 3, 4, 5, 7);
    const result = generateFileName(date, []);
    expect(result).toBe('20240102-030405-007.png');
  });

  it('同名ファイルが存在する場合 -1 を付与する', () => {
    const date = new Date(2024, 2, 15, 9, 5, 30, 123);
    const existing = ['20240315-090530-123.png'];
    const result = generateFileName(date, existing);
    expect(result).toBe('20240315-090530-123-1.png');
  });

  it('連番が既に存在する場合、次の番号を付与する', () => {
    const date = new Date(2024, 2, 15, 9, 5, 30, 123);
    const existing = [
      '20240315-090530-123.png',
      '20240315-090530-123-1.png',
      '20240315-090530-123-2.png',
    ];
    const result = generateFileName(date, existing);
    expect(result).toBe('20240315-090530-123-3.png');
  });
});

describe('resolveImageDir', () => {
  it('relative モードで Markdown ファイルと同じディレクトリの指定フォルダを返す', () => {
    const result = resolveImageDir(
      'C:/projects/docs/README.md',
      'relative',
      'assets',
    );
    expect(result).toBe('C:/projects/docs/assets');
  });

  it('relative モードでネストしたパスでも正しく動作する', () => {
    const result = resolveImageDir(
      'C:/projects/docs/sub/note.md',
      'relative',
      'images',
    );
    expect(result).toBe('C:/projects/docs/sub/images');
  });

  it('workspace モードでワークスペースルートの指定フォルダを返す', () => {
    const result = resolveImageDir(
      'C:/projects/docs/README.md',
      'workspace',
      'assets/images',
      'C:/projects',
    );
    expect(result).toBe('C:/projects/assets/images');
  });

  it('workspace モードで workspaceRoot が未指定の場合エラーを投げる', () => {
    expect(() =>
      resolveImageDir(
        'C:/projects/docs/README.md',
        'workspace',
        'assets',
      ),
    ).toThrow();
  });

  it('バックスラッシュをスラッシュに正規化する', () => {
    const result = resolveImageDir(
      'C:\\projects\\docs\\README.md',
      'relative',
      'assets',
    );
    expect(result).toBe('C:/projects/docs/assets');
  });
});

describe('buildMarkdownLink', () => {
  it('altテキストありで画像リンクを生成する', () => {
    const result = buildMarkdownLink('assets/20240315-090530-123.png', 'スクリーンショット');
    expect(result).toBe('![スクリーンショット](assets/20240315-090530-123.png)');
  });

  it('altテキストが空文字の場合も正しく生成する', () => {
    const result = buildMarkdownLink('assets/20240315-090530-123.png', '');
    expect(result).toBe('![](assets/20240315-090530-123.png)');
  });

  it('パス内のバックスラッシュをスラッシュに正規化する', () => {
    const result = buildMarkdownLink('assets\\images\\test.png', 'テスト');
    expect(result).toBe('![テスト](assets/images/test.png)');
  });
});
