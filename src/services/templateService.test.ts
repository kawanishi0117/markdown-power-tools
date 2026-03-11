import { describe, it, expect } from 'vitest';
import {
  getMarkdownTemplate,
  getMermaidTemplate,
  type MarkdownTemplateKey,
  type MermaidTemplateKey,
} from './templateService';

describe('getMarkdownTemplate', () => {
  it('table: 2列3行のテーブルテンプレートを返す', () => {
    const result = getMarkdownTemplate('table');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '| 列1 | 列2 |\n| --- | --- |\n| | |\n| | |\n| | |'
    );
  });

  it('codeBlock: 言語指定付きコードブロックを返す（デフォルト言語は空）', () => {
    const result = getMarkdownTemplate('codeBlock');
    expect(result).not.toBeNull();
    expect(result).toBe('```\n\n```');
  });

  it('codeBlock: language オプションで言語を指定できる', () => {
    const result = getMarkdownTemplate('codeBlock', { language: 'typescript' });
    expect(result).toBe('```typescript\n\n```');
  });

  it('checklist: 3項目のチェックリストを返す', () => {
    const result = getMarkdownTemplate('checklist');
    expect(result).not.toBeNull();
    expect(result).toBe('- [ ] 項目1\n- [ ] 項目2\n- [ ] 項目3');
  });

  it('details: details/summary テンプレートを返す', () => {
    const result = getMarkdownTemplate('details');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '<details>\n<summary>タイトル</summary>\n\n内容\n\n</details>'
    );
  });

  it('blockquote: 引用テンプレートを返す', () => {
    const result = getMarkdownTemplate('blockquote');
    expect(result).not.toBeNull();
    expect(result).toBe('> 引用テキスト');
  });

  it('存在しないキーで null を返す', () => {
    // 型安全を回避して不正なキーをテスト
    const result = getMarkdownTemplate('nonexistent' as MarkdownTemplateKey);
    expect(result).toBeNull();
  });
});

describe('getMermaidTemplate', () => {
  it('flowchart: フローチャートの雛形を返す', () => {
    const result = getMermaidTemplate('flowchart');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '```mermaid\nflowchart TD\n    A[開始] --> B{条件}\n    B -->|Yes| C[処理1]\n    B -->|No| D[処理2]\n```'
    );
  });

  it('sequence: シーケンス図の雛形を返す', () => {
    const result = getMermaidTemplate('sequence');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '```mermaid\nsequenceDiagram\n    participant A as ユーザー\n    participant B as システム\n    A->>B: リクエスト\n    B-->>A: レスポンス\n```'
    );
  });

  it('er: ER図の雛形を返す', () => {
    const result = getMermaidTemplate('er');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '```mermaid\nerDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ LINE_ITEM : contains\n```'
    );
  });

  it('state: ステート図の雛形を返す', () => {
    const result = getMermaidTemplate('state');
    expect(result).not.toBeNull();
    expect(result).toBe(
      '```mermaid\nstateDiagram-v2\n    [*] --> 待機中\n    待機中 --> 処理中 : 開始\n    処理中 --> 完了 : 成功\n    処理中 --> エラー : 失敗\n    完了 --> [*]\n```'
    );
  });

  it('存在しないキーで null を返す', () => {
    const result = getMermaidTemplate('nonexistent' as MermaidTemplateKey);
    expect(result).toBeNull();
  });
});
