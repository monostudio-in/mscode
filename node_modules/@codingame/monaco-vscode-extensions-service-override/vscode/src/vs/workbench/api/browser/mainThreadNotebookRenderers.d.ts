import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadNotebookRenderersShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { INotebookRendererMessagingService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookRendererMessagingService.service";
export declare class MainThreadNotebookRenderers extends Disposable implements MainThreadNotebookRenderersShape {
    private readonly messaging;
    private readonly proxy;
    constructor(extHostContext: IExtHostContext, messaging: INotebookRendererMessagingService);
    $postMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}
