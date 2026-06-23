import * as vscode from "vscode";

import { normalizeClassNames } from "../transform/normalizeClassNames";

export function registerCleanClassName(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "better-help.normalizeClassNames",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;
      const text = doc.getText();

      const regex = /className\s*=\s*"([\s\S]*?)"/gm;

      const edits: {
        start: number;
        end: number;
        replacement: string;
      }[] = [];

      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const inner = match[1];

        const normalized = normalizeClassNames(inner);

        const start = match.index;
        const end = match.index + fullMatch.length;

        const replacement = `className="${normalized}"`;

        // skip no-op changes
        if (fullMatch === replacement) continue;

        edits.push({ start, end, replacement });
      }

      if (edits.length === 0) return;

      await editor.edit((editBuilder) => {
        for (const e of edits) {
          const range = new vscode.Range(
            doc.positionAt(e.start),
            doc.positionAt(e.end),
          );

          editBuilder.replace(range, e.replacement);
        }
      });
    },
  );

  context.subscriptions.push(disposable);
}
