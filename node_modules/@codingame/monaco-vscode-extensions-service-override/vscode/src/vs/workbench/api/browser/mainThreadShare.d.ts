import { IDocumentFilterDto, MainThreadShareShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IShareService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/share/common/share.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadShare implements MainThreadShareShape {
    private readonly shareService;
    private readonly proxy;
    private providers;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, shareService: IShareService);
    $registerShareProvider(handle: number, selector: IDocumentFilterDto[], id: string, label: string, priority: number): void;
    $unregisterShareProvider(handle: number): void;
    dispose(): void;
}
