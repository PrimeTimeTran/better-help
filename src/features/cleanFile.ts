import * as vscode from "vscode";
import { fixTailwindWarnings } from "../transform/fixTailwindWarnings";
import { normalizeClassNames } from "../transform/normalizeClassNames";

export async function cleanFile(doc: vscode.TextDocument) {
  const text = doc.getText();

  // STEP 1: fix known lint / Tailwind warnings
  const tailwindFixed = fixTailwindWarnings(text);

  // STEP 2: normalize className strings
  const normalized = normalizeClassNames(tailwindFixed);

  if (normalized === text) return;

  const edit = new vscode.WorkspaceEdit();

  const fullRange = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(text.length),
  );

  edit.replace(doc.uri, fullRange, normalized);

  await vscode.workspace.applyEdit(edit);
}
