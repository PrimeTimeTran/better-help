import * as vscode from "vscode";
import { cleanFile } from "../features/cleanFile";

export function registerCleanCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "better-help.clean",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;

      if (!doc.fileName.endsWith(".tsx") && !doc.fileName.endsWith(".jsx")) {
        return;
      }

      await cleanFile(doc);
    },
  );

  context.subscriptions.push(disposable);
}
