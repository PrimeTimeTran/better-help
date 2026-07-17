/* eslint-disable curly */
import * as vscode from "vscode";
import { log } from "../logger";
import path from "path";
import { resolveSymbolLocation } from "../resolver";

type Cleaner = (doc: vscode.TextDocument, actions: vscode.CodeAction[]) => Promise<boolean>;

export async function cleanRust(doc: vscode.TextDocument) {
  log(`1... HMR Starting comprehensive clean for: ${doc.fileName}`);
  log(`2 works with cmd+r?`);
  log(`3 worked with cmd+r!!!!`);
  // see ./HMR.MD
  log(`6 worked with cmd+r!!!!`);
  log(`6 worked with cmd+r!!!!`);
  log(`6 worked with cmd+r!!!!`);
  log(`6 worked with cmd+r!!!!`);
  log(`6 worked with cmd+r!!!!`);
  log(`6 worked with cmd+r!!!!`);

  const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
    "vscode.executeCodeActionProvider",
    doc.uri,
    new vscode.Range(0, 0, doc.lineCount, 0),
    vscode.CodeActionKind.QuickFix.value,
  );

  if (codeActions && codeActions.length > 0) {
    const cleaners: Cleaner[] = [cleanImports, cleanDbg];
    for (const cleaner of cleaners) {
      log(`Running cleaner: ${cleaner.name}`);
      await cleaner(doc, codeActions);
    }
  }
  log("Starting post-clean unresolved import resolution (Deep Search)...");
  await fixUnresolvedImport(doc);

  log("Cleanup and resolution sequence complete.");
}

export async function cleanImports(
  doc: vscode.TextDocument,
  actions: vscode.CodeAction[],
): Promise<boolean> {
  const target = actions.find((a) => a.title.toLowerCase().includes("remove all unused imports"));

  if (!target) return false;

  if (target.edit) {
    const success = await vscode.workspace.applyEdit(target.edit);
    if (success) return true;
  }

  if (target.command) {
    log(`Executing command: ${target.command.command}`);
    return await vscode.commands.executeCommand(
      target.command.command,
      ...(target.command.arguments || []),
    );
  }

  return false;
}

export async function cleanDbg(
  doc: vscode.TextDocument,
  actions: vscode.CodeAction[],
): Promise<boolean> {
  const target = actions.find((a) => a.title.toLowerCase().includes("remove dbg!"));

  if (target) {
    log(`Found dbg! fix: "${target.title}"`);
    if (target.edit) {
      const editResult = await vscode.workspace.applyEdit(target.edit);
      log(`cleanDbg applyEdit result: ${editResult}`);
      return editResult;
    }
  }
  return false;
}

export async function fixUnresolvedImport(doc: vscode.TextDocument) {
  log(`fixUnresolvedImport: Scanning diagnostics...`);
  const diagnostics = vscode.languages.getDiagnostics(doc.uri);

  const importErrors = diagnostics.filter(
    (d) => d.message.includes("unresolved import") || d.message.includes("cannot find"),
  );

  for (const error of importErrors) {
    log(`Found error: ${error.message} at line ${error.range.start.line}`);

    const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      "vscode.executeCodeActionProvider",
      doc.uri,
      error.range,
      vscode.CodeActionKind.QuickFix.value,
    );

    const importFix = codeActions.find(
      (a) => a.title.toLowerCase().includes("import") || a.title.toLowerCase().includes("create"),
    );

    // 1. If rust-analyzer has a fix, use it
    if (importFix?.edit) {
      log("RA found a fix, applying...");
      await vscode.workspace.applyEdit(importFix.edit);
    }
    // 2. Otherwise, trigger YOUR deep search
    else {
      const match = error.message.match(/`([^`]+)`/);
      const symbolName = match ? match[1] : null;

      if (symbolName) {
        log(`RA had no fix for ${symbolName}, triggering performDeepFSSearch.`);
        await performDeepFSSearch(symbolName, doc);
      }
    }
  }
}

export async function performDeepFSSearch(symbolName: string, targetDoc: vscode.TextDocument) {
  try {
    const cleanSymbol = symbolName.replace(/^crate::/, "");
    log(`[DeepSearch] Starting Pipeline for: ${cleanSymbol}`);

    const fileUris = await vscode.workspace.findFiles("**/*.rs", "**/target/**");
    const filePaths = fileUris.map((uri) => uri.fsPath);
    const matchPath = await resolveSymbolLocation(filePaths, cleanSymbol);

    if (!matchPath) {
      log(`[DeepSearch] Failed to locate ${cleanSymbol}.`);
      return;
    }

    log(`[DeepSearch] Match found at: ${matchPath}`);

    const matchUri = vscode.Uri.file(matchPath);

    const relativePath = vscode.workspace.asRelativePath(matchUri);
    let modulePath = relativePath
      .replace("src/", "")
      .replace(".rs", "")
      .replace(/\/mod$/, "")
      .replace(/\//g, "::");
    const newImport =
      modulePath === "main"
        ? `use crate::${cleanSymbol};`
        : `use crate::${modulePath}::${cleanSymbol};`;

    const edit = new vscode.WorkspaceEdit();
    const currentText = targetDoc.getText();
    const cleanedText = removeBrokenImports(currentText, cleanSymbol);

    edit.replace(targetDoc.uri, new vscode.Range(0, 0, targetDoc.lineCount, 0), cleanedText);
    edit.insert(targetDoc.uri, new vscode.Position(0, 0), `${newImport}\n`);

    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage(`Fixed ${cleanSymbol} via Deep Search.`);
  } catch (err) {
    log(`[DeepSearch] Critical error: ${err}`);
  }
}

export async function getSymbolUri(symbolName: string): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles("**/*.rs", "**/target/**");
  let bestMatch: { uri: vscode.Uri; score: number } = { uri: null as any, score: -1 };

  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file);
    const text = new TextDecoder().decode(content);
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.includes(`fn ${symbolName}`) && !line.trim().startsWith("//")) {
        return file;
      }
    }
  }
  return null;
}

export async function handleUnresolvedImport(
  doc: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
) {
  // 1. Ask RA for its own fixes first
  const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
    "vscode.executeCodeActionProvider",
    doc.uri,
    diagnostic.range,
    vscode.CodeActionKind.QuickFix.value,
  );

  // Scenario 1 & 2: If RA has a fix, take it (it's the most reliable)
  const importFix = codeActions.find((a) => a.title.toLowerCase().includes("import"));
  if (importFix?.edit) {
    await vscode.workspace.applyEdit(importFix.edit);
    return;
  }

  // Scenario 3: If RA failed (no fix found), we trigger FS Search
  // Extract the symbol name from the error message (e.g., "cannot find function `run_agent_loop`")
  const match = diagnostic.message.match(/`([^`]+)`/);
  const symbolName = match ? match[1] : null;

  if (symbolName) {
    log(`RA couldn't fix it. Searching FS for: ${symbolName}`);
    await performDeepFSSearch(symbolName, doc);
  }
}

export function getUpdatedFileContent(
  currentContent: string,
  newImport: string,
  symbol: string,
): string {
  const importRegex = new RegExp(`use\\s+.*::${symbol}\\s*;\\n?`, "g");
  let updatedContent = currentContent.replace(importRegex, "");
  updatedContent = updatedContent.replace(/\n{3,}/g, "\n\n");
  return `${newImport}\n${updatedContent.trimStart()}`;
}

// Instead of raw fs, use this to resolve your paths
export function getWorkspacePath(relativePath: string): string {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceRoot) throw new Error("No workspace folder found!");
  return path.join(workspaceRoot, relativePath);
}

export function removeBrokenImports(currentContent: string, symbol: string): string {
  // 1. Match simple imports: use crate::a::run_agent_loop;
  const simpleImportRegex = new RegExp(`use\\s+[^;]*::${symbol};\\s*\\n?`, "g");

  // 2. Match grouped imports: use crate::{Logger, run_agent_loop};
  // This looks for the symbol inside braces and handles the comma cleaning
  const groupImportRegex = new RegExp(`use\\s+crate::\\{[^}]*${symbol}[^}]*\\};\\s*\\n?`, "g");

  let updated = currentContent.replace(simpleImportRegex, "");
  updated = updated.replace(groupImportRegex, "");

  return updated.replace(/\n{3,}/g, "\n\n").trim();
}
