import { URI } from "../../../../../base/common/uri.js";
import { IChatArtifacts } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/tools/chatArtifactsService";
export declare const IChatArtifactsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatArtifactsService>;
export interface IChatArtifactsService {
    readonly _serviceBrand: undefined;
    getArtifacts(sessionResource: URI): IChatArtifacts;
}
