import * as vscode from "vscode";
import { alignTrailingComments } from "../transform/alignTrailingComments";

export function registerAlignTrailingComments(
  context: vscode.ExtensionContext,
) {
  const disposable = vscode.commands.registerCommand(
    "better-help.alignTrailingComments",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;

      if (!doc.fileName.endsWith(".tsx") && !doc.fileName.endsWith(".jsx")) {
        return;
      }

      const text = doc.getText();
      const updated = alignTrailingComments(text, 10);

      if (text === updated) return;

      const fullRange = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(text.length),
      );

      await editor.edit((edit) => {
        edit.replace(fullRange, updated);
      });
    },
  );

  context.subscriptions.push(disposable);
}
