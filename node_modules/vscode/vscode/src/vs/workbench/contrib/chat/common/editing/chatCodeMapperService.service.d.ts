import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ICodeMapperProvider, ICodeMapperRequest, ICodeMapperResponse, ICodeMapperResult } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/editing/chatCodeMapperService";
export declare const ICodeMapperService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeMapperService>;
export interface ICodeMapperService {
    readonly _serviceBrand: undefined;
    readonly providers: ICodeMapperProvider[];
    registerCodeMapperProvider(handle: number, provider: ICodeMapperProvider): IDisposable;
    mapCode(request: ICodeMapperRequest, response: ICodeMapperResponse, token: CancellationToken): Promise<ICodeMapperResult | undefined>;
}
