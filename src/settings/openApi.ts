/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";
import AuthSettings from "./authenticator";
export default class OpenAPIManager {
  private static _instance: OpenAPIManager;
  static inProgress = false;
  static maxTokens: number;
  static temprature: number;
  static model: string;
  private authInstance: AuthSettings;
  constructor(authInstance: AuthSettings) {
    let extensionConfiguration = vscode.workspace.getConfiguration("jones");
    OpenAPIManager.maxTokens = extensionConfiguration.MAX_TOKENS;
    OpenAPIManager.temprature = extensionConfiguration.TEMRATURE;
    OpenAPIManager.model = extensionConfiguration.MODEL;
    this.authInstance = authInstance;
  }
  static init(context: vscode.ExtensionContext): void {
    AuthSettings.init(context);
    OpenAPIManager._instance = new OpenAPIManager(AuthSettings.instance);
  }

  static get instance(): OpenAPIManager {
    return OpenAPIManager._instance;
  }

  async sendQuery(querryString: string): Promise<string[] | undefined> {
    const apiToken = await this.authInstance.getToken();
    const openai = new OpenAIApi(new Configuration({ apiKey: apiToken }));
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
      let responses: string[] = [];
      response.data.choices.forEach((choice) => {
        var lines = choice.text!.split("\n");
        lines.splice(0, 2);
        responses.push(lines.join("\n"));
      });
      return responses;
    } catch (err: any) {
      vscode.window.showErrorMessage(err.response.data.error.message);
      OpenAPIManager.inProgress = false;
      return [];
    }
  }
}
