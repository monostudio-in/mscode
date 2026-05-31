import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { INotebookCellStatusBarService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookCellStatusBarService.service";
import { INotebookContributionData, NotebookExtensionDescription, TransientOptions } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadNotebookShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadNotebooks implements MainThreadNotebookShape {
    private readonly _notebookService;
    private readonly _cellStatusBarService;
    private readonly _logService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _notebookSerializer;
    private readonly _notebookCellStatusBarRegistrations;
    constructor(extHostContext: IExtHostContext, _notebookService: INotebookService, _cellStatusBarService: INotebookCellStatusBarService, _logService: ILogService);
    dispose(): void;
    $registerNotebookSerializer(handle: number, extension: NotebookExtensionDescription, viewType: string, options: TransientOptions, data: INotebookContributionData | undefined): void;
    $unregisterNotebookSerializer(handle: number): void;
    $emitCellStatusBarEvent(eventHandle: number): void;
    $registerNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined, viewType: string): Promise<void>;
    $unregisterNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined): Promise<void>;
}
