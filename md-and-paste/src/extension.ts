import * as vscode from 'vscode';
import { pasteImage, hasClipboardImage } from './commands/pasteImage';
import {
  insertTable,
  insertCodeBlock,
  insertChecklist,
  insertDetails,
  insertBlockquote,
} from './commands/insertMarkdown';
import {
  insertMermaidFlowchart,
  insertMermaidSequence,
  insertMermaidEr,
  insertMermaidState,
} from './commands/insertMermaid';

/** 拡張機能のアクティベーション — 全コマンドを登録 */
export const activate = (context: vscode.ExtensionContext) => {
  const commands: [string, () => Promise<void>][] = [
    ['mdAndPaste.pasteImage', pasteImage],
    ['mdAndPaste.insertTable', insertTable],
    ['mdAndPaste.insertCodeBlock', insertCodeBlock],
    ['mdAndPaste.insertChecklist', insertChecklist],
    ['mdAndPaste.insertDetails', insertDetails],
    ['mdAndPaste.insertBlockquote', insertBlockquote],
    ['mdAndPaste.insertMermaidFlowchart', insertMermaidFlowchart],
    ['mdAndPaste.insertMermaidSequence', insertMermaidSequence],
    ['mdAndPaste.insertMermaidEr', insertMermaidEr],
    ['mdAndPaste.insertMermaidState', insertMermaidState],
  ];

  for (const [id, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }

  // Ctrl+V オーバーライド: Markdown + 画像クリップボード時のみフック
  const overridePaste = vscode.commands.registerCommand(
    'editor.action.clipboardPasteAction',
    async () => {
      const editor = vscode.window.activeTextEditor;

      // Markdown以外 → 標準貼り付けに委譲
      if (!editor || editor.document.languageId !== 'markdown') {
        await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
        return;
      }

      // クリップボードに画像がなければ → 標準貼り付けに委譲
      if (!hasClipboardImage()) {
        await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
        return;
      }

      // Markdown かつ画像あり → pasteImage 実行
      await pasteImage();
    },
  );
  context.subscriptions.push(overridePaste);
};

/** 拡張機能のディアクティベーション */
export const deactivate = () => {};
