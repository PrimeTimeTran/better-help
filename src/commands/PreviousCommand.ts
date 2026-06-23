import * as vscode from "vscode";

export function registerNormalizeSectionComments(
  context: vscode.ExtensionContext,
) {
  const disposable = vscode.commands.registerCommand(
    "better-help.normalizeSectionComments",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const document = editor.document;

      const fullText = document.getText();

      const normalized = fullText.replace(
        /^[ \t]*\/\* ={10,}[\s\S]*?={10,} \*\/$/gm,
        (block) => {
          const lines = block.split("\n").map((line) => line.trim());

          if (lines.length < 3) {
            return block;
          }

          const top = lines[0];

          const middle = lines
            .slice(1, -1)
            .map((line) => {
              const cleaned = line
                .replace(/^\s*\*\s?/, "")
                .replace(/\s*\*\/\s*$/, "")
                .trim();

              return cleaned ? `  ${cleaned}` : "";
            })
            .join("\n");

          const bottom = lines[lines.length - 1];

          return [top, middle, bottom].join("\n");
        },
      );

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length),
      );

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, normalized);
      });
    },
  );

  context.subscriptions.push(disposable);
}
