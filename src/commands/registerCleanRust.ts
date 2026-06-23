import * as vscode from "vscode";
import { cleanRust } from "../features/rust-cleaner";

export function registerCleanRust(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("better-help.registerCleanRust", async () => {
    const editor = vscode.window.activeTextEditor;

    // 1. Guard clause: No editor open
    if (!editor) {
      vscode.window.showInformationMessage("No active editor to clean.");
      return;
    }

    const doc = editor.document;

    // 2. Guard clause: Only run on Rust files
    if (doc.languageId !== "rust") {
      vscode.window.showInformationMessage("This command only supports Rust files.");
      return;
    }

    // 3. Delegate to the refactored cleaner
    try {
      await cleanRust(doc);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to clean Rust file: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}
