import * as vscode from 'vscode'

import { sortLines } from '../features/sortLines'

export function registerSortLines(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('better-help.sortLines', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const { document, selection } = editor
    const range = new vscode.Range(
      new vscode.Position(selection.start.line, 0),
      new vscode.Position(selection.end.line, document.lineAt(selection.end.line).text.length),
    )

    const lines = document.getText(range).split(/\r?\n/)
    const sorted = sortLines(lines)

    await editor.edit((editBuilder) => {
      editBuilder.replace(range, sorted.join(document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'))
    })
  })

  context.subscriptions.push(disposable)
}
