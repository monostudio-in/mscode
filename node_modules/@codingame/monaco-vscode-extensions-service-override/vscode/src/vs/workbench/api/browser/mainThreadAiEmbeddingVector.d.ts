import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadAiEmbeddingVectorShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IAiEmbeddingVectorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadAiEmbeddingVector extends Disposable implements MainThreadAiEmbeddingVectorShape {
    private readonly _AiEmbeddingVectorService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _AiEmbeddingVectorService: IAiEmbeddingVectorService);
    $registerAiEmbeddingVectorProvider(model: string, handle: number): void;
    $unregisterAiEmbeddingVectorProvider(handle: number): void;
}
