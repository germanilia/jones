"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const openApi_1 = require("./openApi");
class EditorManager {
    constructor() {
        this.startAnchor = "{jones}";
        this.endAnchor = "{/jones}";
        this.inProgress = false;
        this._gptManager = openApi_1.default.instance;
    }
    static init(context) {
        openApi_1.default.init(context);
        EditorManager._instance = new EditorManager();
    }
    static get instance() {
        return EditorManager._instance;
    }
    getQueryString(text, userSelection) {
        if (userSelection) {
            const selection = vscode.window.activeTextEditor.selection;
            const selectedText = vscode.window.activeTextEditor.document.getText(selection);
            return selectedText;
        }
        if (text.lastIndexOf(this.startAnchor) === -1 || text.lastIndexOf(this.endAnchor) === -1) {
            return "";
        }
        return text.substring(text.lastIndexOf(this.startAnchor) + this.startAnchor.length, text.lastIndexOf(this.endAnchor));
    }
    async checkEditorText(userSelection = false) {
        if (this.inProgress) {
            return;
        }
        let editor = vscode.window.activeTextEditor;
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
        let replacedText = text.replace(this.replaceString(querryString, userSelection), responses[0]);
        this.replaceTextInEditor(editor, replacedText);
        this.inProgress = false;
    }
    replaceString(querryString, userSelection) {
        return userSelection ? querryString : `${this.startAnchor}${querryString}${this.endAnchor}`;
    }
    replaceTextInEditor(editor, replacedText) {
        editor
            .edit((editBuilder) => {
            editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(0).range.end.e + 1)), replacedText);
        })
            .then(() => {
            console.log("done");
            this.inProgress = false;
        });
    }
}
exports.default = EditorManager;
//# sourceMappingURL=editor.js.map