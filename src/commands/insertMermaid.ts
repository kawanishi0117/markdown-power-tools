import * as vscode from 'vscode';
import { getMermaidTemplate, type MermaidTemplateKey } from '../services/templateService';

/** テンプレートをエディタのカーソル位置に挿入する共通関数 */
const insertTemplate = async (text: string) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  await editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, text);
  });
};

/** 指定キーのMermaidテンプレートを挿入する */
const insertMermaidTemplate = async (key: MermaidTemplateKey) => {
  const template = getMermaidTemplate(key);
  if (template) await insertTemplate(template);
};

/** Mermaid フローチャートを挿入 */
export const insertMermaidFlowchart = async () => {
  await insertMermaidTemplate('flowchart');
};

/** Mermaid シーケンス図を挿入 */
export const insertMermaidSequence = async () => {
  await insertMermaidTemplate('sequence');
};

/** Mermaid ER図を挿入 */
export const insertMermaidEr = async () => {
  await insertMermaidTemplate('er');
};

/** Mermaid ステート図を挿入 */
export const insertMermaidState = async () => {
  await insertMermaidTemplate('state');
};
