import { Event } from "../../../base/common/event.js";
import { ISecretStorageProvider } from "@codingame/monaco-vscode-secret-storage-service-override/vscode/vs/platform/secrets/common/secrets";
export declare const ISecretStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISecretStorageService>;
export interface ISecretStorageService extends ISecretStorageProvider {
    readonly _serviceBrand: undefined;
    readonly onDidChangeSecret: Event<string>;
}
