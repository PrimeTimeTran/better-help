import * as vscode from "vscode";

export async function cleanRust(doc: vscode.TextDocument) {
  const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
    "vscode.executeCodeActionProvider",
    doc.uri,
    new vscode.Range(0, 0, doc.lineCount, 0),
    vscode.CodeActionKind.QuickFix.value,
  );

  if (!codeActions || codeActions.length === 0) {
    vscode.window.showInformationMessage("No fixes found by rust-analyzer.");
    return;
  }

  const fixActions = codeActions.filter(
    (action) => action.title.includes("Remove unused import") || action.title.includes("Import"),
  );

  // Combine edits to avoid range conflicts
  const combinedEdit = new vscode.WorkspaceEdit();

  for (const action of fixActions) {
    if (action.edit) {
      // Merge individual edits into one
      // Note: This works best if edits don't overlap
      for (const [uri, edits] of action.edit.entries()) {
        combinedEdit.set(uri, edits);
      }
    }
  }

  const success = await vscode.workspace.applyEdit(combinedEdit);
  if (success) {
    vscode.window.showInformationMessage(`Applied ${fixActions.length} fixes.`);
  }
}

export function registerCleanRust(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("better-help.registerCleanRust", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const doc = editor.document;

    if (!doc.fileName.endsWith(".rs")) {
      return;
    }

    await cleanRust(doc);
  });

  context.subscriptions.push(disposable);
}
