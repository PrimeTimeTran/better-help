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

  // 2. Perform standard quick-fix cleanups
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

// export async function performDeepFSSearch(symbolName: string, targetDoc: vscode.TextDocument) {
//   try {
//     const cleanSymbol = symbolName.replace(/^crate::/, "");
//     log(`[DeepSearch] Looking for: ${cleanSymbol}`);

//     const fileUris = await vscode.workspace.findFiles("**/*.rs", "**/target/**");
//     const filePaths = fileUris.map((uri) => uri.fsPath);

//     const matchPath = await resolveSymbolLocation(filePaths, cleanSymbol);

//     if (!matchPath) {
//       log(`[DeepSearch] Failed to locate ${cleanSymbol}.`);
//       return;
//     }

//     log(`[DeepSearch] Match found at: ${matchPath}`);

//     // 1. Prepare the Edit
//     const matchUri = vscode.Uri.file(matchPath);
//     const edit = new vscode.WorkspaceEdit();

//     // 2. Open the file to modify it (ensure it is public)
//     const symbolDoc = await vscode.workspace.openTextDocument(matchUri);
//     const lineIndex = findLineNumberForSymbol(symbolDoc, cleanSymbol);
//     const line = symbolDoc.lineAt(lineIndex);

//     if (!line.text.includes("pub ")) {
//       log(`[DeepSearch] Adding 'pub' to ${cleanSymbol} at line ${lineIndex}`);
//       edit.insert(matchUri, new vscode.Position(lineIndex, 0), "pub ");
//     }

//     // 3. Construct the import path
//     const relativePath = vscode.workspace.asRelativePath(matchUri);
//     let modulePath = relativePath.replace("src/", "").replace(".rs", "");
//     modulePath = modulePath.replace(/\/mod$/, "").replace(/\//g, "::");

//     const fullImport = `use crate::${modulePath}::${cleanSymbol};`;
//     log(`[DeepSearch] Inserting import: ${fullImport}`);
//     const doInsertNotReplace = true;
//     if (doInsertNotReplace) {
//       // use crate::ai::run_agent_loop;
//       // use crate::{logger::Logger, run_agent_loop};
//       edit.insert(targetDoc.uri, new vscode.Position(0, 0), `${fullImport}\n`);
//       const success = await vscode.workspace.applyEdit(edit);
//       if (success) {
//         log(`[DeepSearch] Success! Applied edit to ${matchPath}`);
//         vscode.window.showInformationMessage(`Fixed ${cleanSymbol} via Deep Search.`);
//       } else {
//         log(`[DeepSearch] applyEdit returned false.`);
//       }
//     } else {
//       const currentText = targetDoc.getText();
//       const newImport = `use crate::${modulePath}::${cleanSymbol};`;
//       const updatedText = getUpdatedFileContent(currentText, newImport, cleanSymbol);
//       edit.replace(targetDoc.uri, new vscode.Range(0, 0, targetDoc.lineCount, 0), updatedText);
//     }
//   } catch (err) {
//     log(`[DeepSearch] CRITICAL ERROR: ${err}`);
//   }
// }

export async function performDeepFSSearch(symbolName: string, targetDoc: vscode.TextDocument) {
  try {
    const cleanSymbol = symbolName.replace(/^crate::/, "");
    log(`[DeepSearch] Starting Pipeline for: ${cleanSymbol}`);

    // 1. Resolve the path (The Smart Way)
    const fileUris = await vscode.workspace.findFiles("**/*.rs", "**/target/**");
    const filePaths = fileUris.map((uri) => uri.fsPath);
    const matchPath = await resolveSymbolLocation(filePaths, cleanSymbol);

    if (!matchPath) {
      log(`[DeepSearch] Failed to locate ${cleanSymbol}.`);
      return;
    }

    log(`[DeepSearch] Match found at: ${matchPath}`);

    // 2. Re-create the Uri from the path (The "Bridge")
    const matchUri = vscode.Uri.file(matchPath);

    // 3. Logic to calculate the Rust import path (modulePath)
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

    // 4. Use the original logic to clean and replace
    const edit = new vscode.WorkspaceEdit();
    const currentText = targetDoc.getText();
    const cleanedText = removeBrokenImports(currentText, cleanSymbol);

    // Apply full document replacement for safety
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
        // High score for actual definition
        return file; // Return immediately if we found a non-commented definition
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

  // Scenario 3: If RA failed (no fix found), we trigger your FS Search
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

  // Clean up excessive empty lines created by the removal
  return updated.replace(/\n{3,}/g, "\n\n").trim();
}
