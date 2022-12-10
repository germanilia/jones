"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tokenNmae = "jones_token";
class AuthSettings {
    constructor(secretStorage) {
        this.secretStorage = secretStorage;
    }
    static init(context) {
        if (AuthSettings._instance) {
            return;
        }
        AuthSettings._instance = new AuthSettings(context.secrets);
    }
    static get instance() {
        return AuthSettings._instance;
    }
    async storeAuthData(token) {
        if (token) {
            this.secretStorage.store(tokenNmae, token);
        }
    }
    async deleteAuthData() {
        this.secretStorage.delete(tokenNmae);
    }
    async getAuthData() {
        return await this.secretStorage.get(tokenNmae);
    }
    async replaceToken() {
        vscode.window.showInformationMessage("Please enter your OpenAI API key");
        const apiToken = await vscode.window.showInputBox({
            placeHolder: "OpenAI API key",
            ignoreFocusOut: true,
            password: true
        });
        if (apiToken) {
            await this.storeAuthData(apiToken);
            return apiToken;
        }
        else {
            throw new Error("No API key entered");
        }
    }
    async getToken() {
        const apiToken = await this.getAuthData();
        if (!apiToken) {
            return await this.replaceToken();
        }
        return apiToken;
    }
}
exports.default = AuthSettings;
//# sourceMappingURL=authenticator.js.map