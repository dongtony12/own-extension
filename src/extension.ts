import * as vscode from "vscode";
import { format as formatSQL } from "sql-formatter";

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "DELETE",
  "JOIN",
  "ALTER",
  "TABLE",
  "ADD",
  "COLUMN",
  "CREATE",
  "TRIGGER",
  "BEFORE",
  "AFTER",
  "BEGIN",
  "END",
  "SET",
  "ON",
  "AS",
  "NULL",
  "NOT",
  "DEFAULT",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "CONSTRAINT",
  "REFERENCES",
  "AND",
  "OR",
  "IN",
  "IS",
  "LIKE",
  "EXISTS",
  "BETWEEN",
  "DISTINCT",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION",
  "ALL",
  "ANY",
  "SOME",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "CROSS",
  "NATURAL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "CAST",
  "CONVERT",
];

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.workspace.onWillSaveTextDocument((event) => {
    if (event.document.languageId === "ncrds") {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        let text = document.getText();
        text = convertKeywordsToUppercase(text);
        const formattedText = formatNcrdsText(text);

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        event.waitUntil(
          Promise.resolve([vscode.TextEdit.replace(fullRange, formattedText)])
        );
      }
    }
  });

  let formatSQLCommand = vscode.commands.registerCommand(
    "extension.formatSQL",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === "ncrds") {
        const document = editor.document;
        let text = document.getText();
        text = convertKeywordsToUppercase(text);
        const formattedText = formatNcrdsText(text);

        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        editor.edit((editBuilder) => {
          editBuilder.replace(fullRange, formattedText);
        });
      } else {
        vscode.window.showInformationMessage("No NCRDS file is active.");
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(formatSQLCommand);
}

function convertKeywordsToUppercase(text: string): string {
  const regex = new RegExp(`\\b(${SQL_KEYWORDS.join("|")})\\b`, "gi");
  return text.replace(regex, (match) => match.toUpperCase());
}

function formatNcrdsText(text: string): string {
  try {
    return formatSQL(text, { language: "mysql" });
  } catch (error) {
    console.error("Error formatting SQL:", error);
    return text;
  }
}

export function deactivate() {}
