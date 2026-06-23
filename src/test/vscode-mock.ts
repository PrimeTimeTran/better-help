// test/vscode-mock.ts
export const Uri = {
  file: (path: string) => ({ path, fsPath: path, scheme: "file" }),
};

export const workspace = {
  asRelativePath: (uri: any) => uri.path.replace("/project/", ""),
};

export const Position = class {
  constructor(
    public line: number,
    public character: number,
  ) {}
};

export const WorkspaceEdit = class {
  insert() {}
  delete() {}
};

export const window = {
  showInformationMessage: (msg: string) => Promise.resolve(msg),
};
