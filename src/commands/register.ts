import * as vscode from "vscode";

export function registerCommand() {
  return vscode.commands.registerCommand("better-help.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from better-help!");
  });
}
