"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const openai_1 = require("openai");
const authenticator_1 = require("./authenticator");
class OpenAPIManager {
    constructor(authInstance) {
        let extensionConfiguration = vscode.workspace.getConfiguration("jones");
        OpenAPIManager.maxTokens = extensionConfiguration.MAX_TOKENS;
        OpenAPIManager.temprature = extensionConfiguration.TEMRATURE;
        OpenAPIManager.model = extensionConfiguration.MODEL;
        this.authInstance = authInstance;
    }
    static init(context) {
        authenticator_1.default.init(context);
        OpenAPIManager._instance = new OpenAPIManager(authenticator_1.default.instance);
    }
    static get instance() {
        return OpenAPIManager._instance;
    }
    async sendQuery(querryString) {
        const apiToken = await this.authInstance.getToken();
        const openai = new openai_1.OpenAIApi(new openai_1.Configuration({ apiKey: apiToken }));
        try {
            OpenAPIManager.inProgress = true;
            const response = await openai.createCompletion({
                model: OpenAPIManager.model,
                prompt: querryString,
                temperature: OpenAPIManager.temprature,
                max_tokens: OpenAPIManager.maxTokens,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            let responses = [];
            response.data.choices.forEach((choice) => {
                var lines = choice.text.split("\n");
                lines.splice(0, 2);
                responses.push(lines.join("\n"));
            });
            return responses;
        }
        catch (err) {
            vscode.window.showErrorMessage(err.response.data.error.message);
            OpenAPIManager.inProgress = false;
            return [];
        }
    }
}
exports.default = OpenAPIManager;
OpenAPIManager.inProgress = false;
//# sourceMappingURL=openApi.js.map