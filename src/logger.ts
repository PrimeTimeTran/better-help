import * as vscode from "vscode";
import fs from "fs";

export const outputChannel = vscode.window.createOutputChannel("Better Help", {
  log: true,
});

export function initLogger() {
  outputChannel.show(true);
}

export function log(message: string) {
  outputChannel.appendLine(message);
}

export function error(message: string) {
  outputChannel.appendLine(`[ERROR] ${message}`);
}

export function disposeLogger() {
  outputChannel.dispose();
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T | null | undefined>,
  retries: number = 5,
  initialDelay: number = 200,
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    const result = await fn();
    if (result) return result;

    // Exponential backoff + Jitter (random 0-50ms)
    const jitter = Math.random() * 50;
    const delay = Math.pow(2, i) * initialDelay + jitter;

    log(`[Retry] Attempt ${i + 1} yielded no result. Retrying in ${Math.round(delay)}ms...`);
    await new Promise((r) => setTimeout(r, delay));
  }
  return null;
}

export function findLineNumberForSymbol(doc: vscode.TextDocument, symbolName: string): number {
  for (let i = 0; i < doc.lineCount; i++) {
    const line = doc.lineAt(i);
    // Matches "fn name", "struct name", "enum name", etc.
    if (new RegExp(`(fn|struct|enum|trait|type)\\s+${symbolName}\\b`).test(line.text)) {
      return i;
    }
  }
  return 0; // Default to top if not found
}
export async function smartUpdateImport(
  edit: vscode.WorkspaceEdit,
  doc: vscode.TextDocument,
  importString: string,
  symbol: string,
) {
  const text = doc.getText();

  const importRegex = new RegExp(`use\\s+.*::${symbol};`, "g");
  if (importRegex.test(text)) {
    log(`[ImportManager] Found existing import for ${symbol}, replacing...`);
    const match = text.match(importRegex);
    if (match) {
      const start = text.indexOf(match[0]);
      const range = new vscode.Range(
        doc.positionAt(start),
        doc.positionAt(start + match[0].length + 1),
      );
      edit.delete(doc.uri, range);
    }
  }

  // 2. Insert the correct one at the top (after other uses)
  edit.insert(doc.uri, new vscode.Position(0, 0), `${importString}\n`);
}

/**
 * Now a pure function: no VS Code dependencies!
 * @param relativePath - The path relative to the workspace root (e.g., "src/ui/mod.rs")
 */
export function getCratePath(relativePath: string): string {
  // 1. Remove 'src/' and '.rs'
  let path = relativePath.replace(/^src\//, "").replace(/\.rs$/, "");

  // 2. Handle mod.rs: if path is 'ui/mod', it's just 'ui'
  path = path.replace(/\/mod$/, "");

  // 3. Convert slashes to ::
  const parts = path.split("/");

  return parts.join("::");
}

// Pure logic: returns true if the module declaration is missing
export function needsModuleDeclaration(fileContent: string, moduleName: string): boolean {
  const regex = new RegExp(`pub\\s+mod\\s+${moduleName}\\s*;`);
  return !regex.test(fileContent);
}

export async function verifySymbolExists(filePath: string, symbol: string): Promise<boolean> {
  const uri = vscode.Uri.file(filePath);
  // Use VS Code's virtual filesystem
  const uint8Array = await vscode.workspace.fs.readFile(uri);
  const content = new TextDecoder().decode(uint8Array);

  const regex = new RegExp(`(?:fn|pub|const|struct)\\s+${symbol}\\b`);
  return regex.test(content);
}
