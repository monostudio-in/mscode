import { IRemoteCodingAgent } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/remoteCodingAgents/common/remoteCodingAgentsService";
export interface IRemoteCodingAgentsService {
    readonly _serviceBrand: undefined;
    getRegisteredAgents(): IRemoteCodingAgent[];
    getAvailableAgents(): IRemoteCodingAgent[];
    registerAgent(agent: IRemoteCodingAgent): void;
}
export declare const IRemoteCodingAgentsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteCodingAgentsService>;
