import * as vscode from 'vscode';

export interface ImageConfig {
  saveLocationMode: 'relative' | 'workspace';
  saveFolder: string;
  altTextMode: 'prompt' | 'empty' | 'filename';
}

/** 有効な saveLocationMode 値 */
const VALID_SAVE_LOCATION_MODES = ['relative', 'workspace'] as const;

/** 有効な altTextMode 値 */
const VALID_ALT_TEXT_MODES = ['prompt', 'empty', 'filename'] as const;

/** 値が有効な選択肢に含まれるか検証する */
const isValidOption = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);

/** 画像関連の設定を取得（不正な値はデフォルトにフォールバック） */
export const getImageConfig = (): ImageConfig => {
  const config = vscode.workspace.getConfiguration('mdPowerTools.image');

  const rawMode = config.get<string>('saveLocationMode');
  const saveLocationMode = isValidOption(rawMode, VALID_SAVE_LOCATION_MODES)
    ? rawMode
    : 'relative';

  const rawFolder = config.get<string>('saveFolder');
  const saveFolder = typeof rawFolder === 'string' && rawFolder.trim().length > 0
    ? rawFolder.trim()
    : 'assets';

  const rawAltMode = config.get<string>('altTextMode');
  const altTextMode = isValidOption(rawAltMode, VALID_ALT_TEXT_MODES)
    ? rawAltMode
    : 'prompt';

  return { saveLocationMode, saveFolder, altTextMode };
};
