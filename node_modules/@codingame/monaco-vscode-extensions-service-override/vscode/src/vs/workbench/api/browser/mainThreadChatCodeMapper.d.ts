import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { ICodeMapperService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/editing/chatCodeMapperService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ICodeMapperProgressDto, MainThreadCodeMapperShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadChatCodemapper extends Disposable implements MainThreadCodeMapperShape {
    private readonly codeMapperService;
    private providers;
    private readonly _proxy;
    private static _requestHandlePool;
    private _responseMap;
    constructor(extHostContext: IExtHostContext, codeMapperService: ICodeMapperService);
    $registerCodeMapperProvider(handle: number, displayName: string): void;
    $unregisterCodeMapperProvider(handle: number): void;
    $handleProgress(requestId: string, data: ICodeMapperProgressDto): Promise<void>;
}
