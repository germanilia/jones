import * as vscode from "vscode";
import AuthSettings from "./settings/authenticator";
import EditorManager from "./settings/editor";

// This is the activate function for the extension
export async function activate(context: vscode.ExtensionContext) {
  let extensionConfiguration = vscode.workspace.getConfiguration("jones");
  if (!extensionConfiguration.ENABLED) {
    return;
  }
  EditorManager.init(context);
  const editorManager = EditorManager.instance;

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
    AuthSettings.init(context);
    await AuthSettings.instance.replaceToken();
  });
  context.subscriptions.push(commandChangePasswordEvent);

  const commandDeletePasswordEvent = vscode.commands.registerCommand("jones.deletePassword", async () => {
    AuthSettings.init(context);
    await AuthSettings.instance.deleteAuthData();
  });
  context.subscriptions.push(commandDeletePasswordEvent);
}

// This is the deactivate function for the extension
export function deactivate() {}
