"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const authenticator_1 = require("./settings/authenticator");
const editor_1 = require("./settings/editor");
// This is the activate function for the extension
async function activate(context) {
    let extensionConfiguration = vscode.workspace.getConfiguration("jones");
    if (!extensionConfiguration.ENABLED) {
        return;
    }
    editor_1.default.init(context);
    const editorManager = editor_1.default.instance;
    // Create a new event that fires every time the text in the document is changed
    if (extensionConfiguration.INLINE_QUERRY) {
        const textChangedEvent = vscode.workspace.onDidChangeTextDocument(async (event) => {
            editorManager.checkEditorText();
        });
        // Add the change event to the context
        context.subscriptions.push(textChangedEvent);
    }
    const commandTriggeredEvent = vscode.commands.registerCommand("jones.fromSelection", async () => {
        editorManager.checkEditorText(true);
    });
    context.subscriptions.push(commandTriggeredEvent);
    const commandChangePasswordEvent = vscode.commands.registerCommand("jones.changePassword", async () => {
        authenticator_1.default.init(context);
        await authenticator_1.default.instance.replaceToken();
    });
    context.subscriptions.push(commandChangePasswordEvent);
    const commandDeletePasswordEvent = vscode.commands.registerCommand("jones.deletePassword", async () => {
        authenticator_1.default.init(context);
        await authenticator_1.default.instance.deleteAuthData();
    });
    context.subscriptions.push(commandDeletePasswordEvent);
}
exports.activate = activate;
// This is the deactivate function for the extension
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map