import * as vscode from 'vscode';

export interface ImageConfig {
  saveLocationMode: 'relative' | 'workspace';
  saveFolder: string;
  altTextMode: 'prompt' | 'empty' | 'filename';
}

/** 画像関連の設定を取得 */
export const getImageConfig = (): ImageConfig => {
  const config = vscode.workspace.getConfiguration('mdAndPaste.image');
  return {
    saveLocationMode: config.get<'relative' | 'workspace'>('saveLocationMode', 'relative'),
    saveFolder: config.get<string>('saveFolder', 'assets'),
    altTextMode: config.get<'prompt' | 'empty' | 'filename'>('altTextMode', 'prompt'),
  };
};
