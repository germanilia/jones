import { ExtensionContext, SecretStorage } from "vscode";
import * as vscode from "vscode";

const tokenNmae = "jones_token";
export default class AuthSettings {
  private static _instance: AuthSettings;
  constructor(private secretStorage: SecretStorage) {}

  static init(context: ExtensionContext): void {
    if (AuthSettings._instance) {
      return;
    }
    AuthSettings._instance = new AuthSettings(context.secrets);
  }

  static get instance(): AuthSettings {
    return AuthSettings._instance;
  }

  async storeAuthData(token?: string): Promise<void> {
    if (token) {
      this.secretStorage.store(tokenNmae, token);
    }
  }

  async deleteAuthData(): Promise<void> {
    this.secretStorage.delete(tokenNmae);
  }

  async getAuthData(): Promise<string | undefined> {
    return await this.secretStorage.get(tokenNmae);
  }

  async replaceToken(): Promise<string> {
    vscode.window.showInformationMessage("Please enter your OpenAI API key");
    const apiToken = await vscode.window.showInputBox({
      placeHolder: "OpenAI API key",
      ignoreFocusOut: true,
      password: true
    });
    if (apiToken) {
      await this.storeAuthData(apiToken);
      return apiToken;
    } else {
      throw new Error("No API key entered");
    }
  }

  async getToken(): Promise<string> {
    const apiToken = await this.getAuthData();
    if (!apiToken) {
      return await this.replaceToken();
    }
    return apiToken!;
  }
}
