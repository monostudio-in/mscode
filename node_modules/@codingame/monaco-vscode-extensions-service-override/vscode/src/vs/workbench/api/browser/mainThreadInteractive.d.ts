import { MainThreadInteractiveShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IInteractiveDocumentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/interactive/browser/interactiveDocumentService.service";
export declare class MainThreadInteractive implements MainThreadInteractiveShape {
    private readonly _proxy;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, interactiveDocumentService: IInteractiveDocumentService);
    dispose(): void;
}
