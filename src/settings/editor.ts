import * as vscode from "vscode";
import OpenAPIManager from "./openApi";
export default class EditorManager {
  private static _instance: EditorManager;
  private startAnchor = "{jones}";
  private endAnchor = "{/jones}";
  public inProgress = false;
  private _gptManager: OpenAPIManager;
  constructor() {
    this._gptManager = OpenAPIManager.instance;
  }

  static init(context: vscode.ExtensionContext): void {
    OpenAPIManager.init(context);
    EditorManager._instance = new EditorManager();
  }

  static get instance(): EditorManager {
    return EditorManager._instance;
  }

  getQueryString(text: string, userSelection: boolean): string {
    if (userSelection) {
      const selection = vscode.window.activeTextEditor!.selection;
      const selectedText = vscode.window.activeTextEditor!.document.getText(selection);
      return selectedText;
    }
    if (text.lastIndexOf(this.startAnchor) === -1 || text.lastIndexOf(this.endAnchor) === -1) {
      return "";
    }
    return text.substring(
      text.lastIndexOf(this.startAnchor) + this.startAnchor.length,
      text.lastIndexOf(this.endAnchor)
    );
  }

  async checkEditorText(userSelection: boolean = false) {
    if (this.inProgress) {
      return;
    }
    let editor = vscode.window.activeTextEditor!;
    if (!editor) {
      return;
    }

    let text = editor.document.getText();
    var querryString = this.getQueryString(text, userSelection);
    if (querryString.length === 0) {
      return;
    }
    this.inProgress = true;
    let responses = await this._gptManager.sendQuery(querryString);

    if (!responses || responses.length === 0) {
      this.inProgress = false;
      return;
    }

    let replacedText = text.replace(this.replaceString(querryString, userSelection), responses![0]);
    this.replaceTextInEditor(editor, replacedText);
    this.inProgress = false;
  }

  private replaceString(querryString: string, userSelection: boolean): string {
    return userSelection ? querryString : `${this.startAnchor}${querryString}${this.endAnchor}`;
  }

  private replaceTextInEditor(editor: any, replacedText: string) {
    editor
      .edit((editBuilder: any) => {
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(editor.document.lineCount - 1, editor!.document.lineAt(0).range.end.e + 1)
          ),
          replacedText
        );
      })
      .then(() => {
        console.log("done");
        this.inProgress = false;
      });
  }
}
