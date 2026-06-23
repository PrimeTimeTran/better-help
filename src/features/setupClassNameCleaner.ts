import * as vscode from "vscode";
import { transformClassNames } from "../transform/transformClassNames";

export function setupClassNameCleaner(context: vscode.ExtensionContext) {
  console.log("🧼 ClassName cleaner (save hook) active");

  const disposable = vscode.workspace.onDidSaveTextDocument((doc) => {
    if (!doc.fileName.endsWith(".tsx") && !doc.fileName.endsWith(".jsx")) {
      return;
    }

    const text = doc.getText();
    const regex = /className\s*=\s*"([\s\S]*?)"/gm;

    const edit = new vscode.WorkspaceEdit();

    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const inner = match[1];

      const normalized = transformClassNames(inner);

      const replacement = `className="${normalized}"`;

      if (fullMatch === replacement) continue;

      const start = match.index;
      const end = match.index + fullMatch.length;

      const range = new vscode.Range(
        doc.positionAt(start),
        doc.positionAt(end),
      );

      edit.replace(doc.uri, range, replacement);
    }

    vscode.workspace.applyEdit(edit);
  });

  context.subscriptions.push(disposable);
}
