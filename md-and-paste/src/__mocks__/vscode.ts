/**
 * vscode モジュールのモック
 * テスト時に vscode API を差し替えるために使用
 */

export const workspace = {
  getConfiguration: (section: string) => ({
    get: (key: string, defaultValue?: unknown) => defaultValue,
  }),
  workspaceFolders: [
    { uri: { fsPath: '/mock/workspace' } },
  ],
};

export const window = {
  showInputBox: async (_options?: unknown) => '',
  showQuickPick: async (items: string[], _options?: unknown) => items[0],
  showInformationMessage: async (_message: string) => undefined,
  showWarningMessage: async (_message: string) => undefined,
  showErrorMessage: async (_message: string) => undefined,
  activeTextEditor: undefined as unknown,
};

export const commands = {
  registerCommand: (_command: string, _callback: (...args: unknown[]) => unknown) => ({
    dispose: () => {},
  }),
  executeCommand: async (_command: string, ..._args: unknown[]) => undefined,
};

export const Uri = {
  file: (path: string) => ({ fsPath: path, scheme: 'file' }),
};

export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
}

export class Position {
  constructor(public line: number, public character: number) {}
}

export class Range {
  constructor(public start: Position, public end: Position) {}
}

export class Selection extends Range {
  constructor(
    public anchor: Position,
    public active: Position,
  ) {
    super(anchor, active);
  }
}
