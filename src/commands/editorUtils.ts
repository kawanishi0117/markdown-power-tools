import * as vscode from 'vscode';

/** テンプレートをエディタのカーソル位置に挿入する共通関数 */
export const insertTemplate = async (text: string): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  try {
    const success = await editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, text);
    });
    if (!success) {
      await vscode.window.showErrorMessage('テンプレートの挿入に失敗しました');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    await vscode.window.showErrorMessage(`テンプレートの挿入中にエラーが発生しました: ${message}`);
  }
};
