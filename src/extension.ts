import * as vscode from "vscode";

import { registerAlignBannerComments } from "./commands/registerAlignCSSBannerComments";
import { registerAlignTrailingComments } from "./commands/registerAlignTrailingComments";
import { registerCleanClassName } from "./commands/registerCleanClassName";
import { registerCleanCommand } from "./commands/registerClean";
import { registerCommand } from "./commands/register";
import { registerSortLines } from "./commands/registerSortLines";
import { registerCleanRust } from "./commands/registerCleanRust";
import { setupClassNameCleaner } from "./features/setupClassNameCleaner";

export function activate(context: vscode.ExtensionContext) {
  setupClassNameCleaner(context);
  registerCleanClassName(context);
  registerCleanCommand(context);
  registerAlignTrailingComments(context);
  registerAlignBannerComments(context);
  registerSortLines(context);
  registerCleanRust(context);
  const disposable = registerCommand();

  context.subscriptions.push(disposable);
}
