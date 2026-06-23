import { vi, describe, it, expect, suite } from "vitest";
import { getCratePath, needsModuleDeclaration } from "../logger.js";
import { getUpdatedFileContent } from "../features/rust-cleaner.js";

// Mock vscode as a complete object chain
vi.mock("vscode", () => ({
  window: {
    createOutputChannel: vi.fn().mockReturnValue({
      appendLine: vi.fn(),
      info: vi.fn(),
    }),
    showInformationMessage: vi.fn(),
  },
  workspace: {
    asRelativePath: vi.fn((uri) => uri.path.replace("/project/", "")),
    findFiles: vi.fn().mockResolvedValue([]),
    fs: {
      readFile: vi.fn(),
    },
    openTextDocument: vi.fn(),
    applyEdit: vi.fn(),
  },
  Uri: {
    file: (path: string) => ({ path }),
  },
  Position: class {
    constructor(
      public line: number,
      public character: number,
    ) {}
  },
  WorkspaceEdit: class {
    insert = vi.fn();
    delete = vi.fn();
  },
}));
