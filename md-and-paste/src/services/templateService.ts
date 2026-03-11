/**
 * Markdown / Mermaid テンプレート提供サービス
 * エディタへの定型構文挿入に使用するテンプレートを管理する
 */

// --- 型定義 ---

export type MarkdownTemplateKey = 'table' | 'codeBlock' | 'checklist' | 'details' | 'blockquote';
export type MermaidTemplateKey = 'flowchart' | 'sequence' | 'er' | 'state';

interface MarkdownTemplateOptions {
  language?: string;
}

// --- Markdown テンプレート ---

/** キーごとのテンプレート生成関数マップ */
const markdownTemplates: Record<MarkdownTemplateKey, (options?: MarkdownTemplateOptions) => string> = {
  table: () =>
    '| 列1 | 列2 |\n| --- | --- |\n| | |\n| | |\n| | |',

  codeBlock: (options) => {
    const lang = options?.language ?? '';
    return `\`\`\`${lang}\n\n\`\`\``;
  },

  checklist: () =>
    '- [ ] 項目1\n- [ ] 項目2\n- [ ] 項目3',

  details: () =>
    '<details>\n<summary>タイトル</summary>\n\n内容\n\n</details>',

  blockquote: () =>
    '> 引用テキスト',
};

// --- Mermaid テンプレート ---

const mermaidTemplates: Record<MermaidTemplateKey, string> = {
  flowchart: [
    '```mermaid',
    'flowchart TD',
    '    A[開始] --> B{条件}',
    '    B -->|Yes| C[処理1]',
    '    B -->|No| D[処理2]',
    '```',
  ].join('\n'),

  sequence: [
    '```mermaid',
    'sequenceDiagram',
    '    participant A as ユーザー',
    '    participant B as システム',
    '    A->>B: リクエスト',
    '    B-->>A: レスポンス',
    '```',
  ].join('\n'),

  er: [
    '```mermaid',
    'erDiagram',
    '    USER ||--o{ ORDER : places',
    '    ORDER ||--|{ LINE_ITEM : contains',
    '```',
  ].join('\n'),

  state: [
    '```mermaid',
    'stateDiagram-v2',
    '    [*] --> 待機中',
    '    待機中 --> 処理中 : 開始',
    '    処理中 --> 完了 : 成功',
    '    処理中 --> エラー : 失敗',
    '    完了 --> [*]',
    '```',
  ].join('\n'),
};

// --- 公開API ---

/** Markdownテンプレートを取得。存在しないキーは null を返す */
export const getMarkdownTemplate = (
  key: MarkdownTemplateKey,
  options?: MarkdownTemplateOptions,
): string | null => {
  const factory = markdownTemplates[key];
  return factory ? factory(options) : null;
};

/** Mermaidテンプレートを取得。存在しないキーは null を返す */
export const getMermaidTemplate = (key: MermaidTemplateKey): string | null => {
  return mermaidTemplates[key] ?? null;
};
