import * as vscode from 'vscode';
import { getMarkdownTemplate, type MarkdownTemplateKey } from '../services/templateService';
import { insertTemplate } from './editorUtils';

/** 指定キーのMarkdownテンプレートを挿入する */
const insertMarkdownTemplate = async (key: MarkdownTemplateKey) => {
  const template = getMarkdownTemplate(key);
  if (template) await insertTemplate(template);
};

/** コードブロック挿入 — 言語選択QuickPickを表示 */
export const insertCodeBlock = async () => {
  const languages = [
    '', 'typescript', 'javascript', 'python', 'go', 'rust',
    'java', 'html', 'css', 'json', 'yaml', 'bash', 'sql', 'markdown',
  ];
  const selected = await vscode.window.showQuickPick(languages, {
    placeHolder: '言語を選択（空欄で言語指定なし）',
  });
  if (selected === undefined) return; // キャンセル
  const template = getMarkdownTemplate('codeBlock', { language: selected });
  if (template) await insertTemplate(template);
};

/** テーブルを挿入 */
export const insertTable = async () => {
  await insertMarkdownTemplate('table');
};

/** チェックリストを挿入 */
export const insertChecklist = async () => {
  await insertMarkdownTemplate('checklist');
};

/** details/summaryを挿入 */
export const insertDetails = async () => {
  await insertMarkdownTemplate('details');
};

/** 引用を挿入 */
export const insertBlockquote = async () => {
  await insertMarkdownTemplate('blockquote');
};
