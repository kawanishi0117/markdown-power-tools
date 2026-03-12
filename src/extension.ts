import * as vscode from 'vscode';
import { createPasteImageProvider } from './commands/pasteImage';
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
  // Markdown テンプレート挿入コマンド
  const commands: [string, () => Promise<void>][] = [
    ['mdPowerTools.insertTable', insertTable],
    ['mdPowerTools.insertCodeBlock', insertCodeBlock],
    ['mdPowerTools.insertChecklist', insertChecklist],
    ['mdPowerTools.insertDetails', insertDetails],
    ['mdPowerTools.insertBlockquote', insertBlockquote],
    ['mdPowerTools.insertMermaidFlowchart', insertMermaidFlowchart],
    ['mdPowerTools.insertMermaidSequence', insertMermaidSequence],
    ['mdPowerTools.insertMermaidEr', insertMermaidEr],
    ['mdPowerTools.insertMermaidState', insertMermaidState],
  ];

  for (const [id, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }

  // Document Paste API: Markdown 本文への画像貼り付け
  context.subscriptions.push(
    vscode.languages.registerDocumentPasteEditProvider(
      { language: 'markdown' },
      createPasteImageProvider(),
      {
        pasteMimeTypes: ['image/*', 'files'],
        providedPasteEditKinds: [
          new vscode.DocumentDropOrPasteEditKind('markdown.image'),
        ],
      },
    ),
  );
};

/** 拡張機能のディアクティベーション */
export const deactivate = () => {};
