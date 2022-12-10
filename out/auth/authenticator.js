"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthSettings {
    constructor(secretStorage) {
        this.secretStorage = secretStorage;
    }
    static init(context) {
        /*
            Create instance of new AuthSettings.
            */
        AuthSettings._instance = new AuthSettings(context.secrets);
    }
    static get instance() {
        /*
            Getter of our AuthSettings existing instance.
            */
        return AuthSettings._instance;
    }
    async storeAuthData(token) {
        /*
            Update values in bugout_auth secret storage.
            */
        if (token) {
            this.secretStorage.store("jones_token", token);
        }
    }
    async getAuthData() {
        /*
            Retrieve data from secret storage.
            */
        return await this.secretStorage.get("jones_token");
    }
}
exports.default = AuthSettings;
//# sourceMappingURL=authenticator.js.map