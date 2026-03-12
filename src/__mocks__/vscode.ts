/**
 * vscode モジュールのモック
 * テスト時に vscode API を差し替えるために使用
 */

export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}

export const workspace = {
  getConfiguration: (section: string) => ({
    get: (key: string, defaultValue?: unknown) => defaultValue,
  }),
  workspaceFolders: [
    { uri: { fsPath: '/mock/workspace' } },
  ],
  fs: {
    readDirectory: async (_uri: unknown): Promise<[string, number][]> => [],
    readFile: async (_uri: unknown): Promise<Uint8Array> => new Uint8Array(),
    writeFile: async (_uri: unknown, _content: Uint8Array): Promise<void> => {},
    createDirectory: async (_uri: unknown): Promise<void> => {},
    stat: async (_uri: unknown) => ({ type: 1, ctime: 0, mtime: 0, size: 0 }),
  },
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
  registerTextEditorCommand: (_command: string, _callback: (...args: unknown[]) => unknown) => ({
    dispose: () => {},
  }),
  executeCommand: async (_command: string, ..._args: unknown[]) => undefined,
};

export const languages = {
  registerDocumentPasteEditProvider: (
    _selector: unknown,
    _provider: unknown,
    _metadata?: unknown,
  ) => ({ dispose: () => {} }),
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

export class SnippetString {
  constructor(public value: string = '') {}
}

export class WorkspaceEdit {
  createFile(_uri: unknown, _options?: unknown) {}
}

export class DocumentDropOrPasteEditKind {
  static readonly Empty = new DocumentDropOrPasteEditKind('');
  constructor(public readonly value: string) {}
  append(_part: string) {
    return new DocumentDropOrPasteEditKind(`${this.value}.${_part}`);
  }
}

export class DocumentPasteEdit {
  additionalEdit?: WorkspaceEdit;
  constructor(
    public insertText: string | SnippetString,
    public title: string,
    public kind: DocumentDropOrPasteEditKind,
  ) {}
}

export class CancellationTokenSource {
  token = { isCancellationRequested: false, onCancellationRequested: () => ({ dispose: () => {} }) };
  cancel() { this.token.isCancellationRequested = true; }
  dispose() {}
}

export class DataTransferItem {
  constructor(private value: unknown) {}
  asString(): Promise<string> { return Promise.resolve(String(this.value)); }
  asFile(): unknown { return undefined; }
}

export class DataTransfer {
  private items = new Map<string, DataTransferItem>();
  get(mimeType: string): DataTransferItem | undefined { return this.items.get(mimeType); }
  set(mimeType: string, item: DataTransferItem): void { this.items.set(mimeType, item); }
  [Symbol.iterator](): Iterator<[string, DataTransferItem]> { return this.items.entries(); }
}
