import * as vscode from "vscode";

import { registerAlignBannerComments } from "./commands/registerAlignCSSBannerComments";
import { registerAlignTrailingComments } from "./commands/registerAlignTrailingComments";
import { registerCleanClassName } from "./commands/registerCleanClassName";
import { registerCleanCommand } from "./commands/registerClean";
import { registerCommand } from "./commands/register";
import { registerSortLines } from "./commands/registerSortLines";
import { registerCleanRust } from "./commands/registerCleanRust";
import { setupClassNameCleaner } from "./features/setupClassNameCleaner";
import { outputChannel, initLogger, log } from "./logger";

export function activate(context: vscode.ExtensionContext) {
  initLogger();
  log("Logger initialized successfully.");
  outputChannel.appendLine("--- LOGGER IS ACTIVE ---");
  console.log("Logger test print"); // Check the "Debug Console" tab too!
  console.log("Logger test print"); // Check the "Debug Console" tab too!
  console.log("Logger test print"); // Check the "Debug Console" tab too!
  vscode.window.showInformationMessage("Extension activated!");
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
