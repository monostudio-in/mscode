import { IProgressStep, IProgressOptions } from "@codingame/monaco-vscode-api/vscode/vs/platform/progress/common/progress";
import { IProgressService } from "@codingame/monaco-vscode-api/vscode/vs/platform/progress/common/progress.service";
import { MainThreadProgressShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";
export declare class MainThreadProgress implements MainThreadProgressShape {
    private readonly _commandService;
    private static readonly URGENT_PROGRESS_SOURCES;
    private readonly _progressService;
    private _progress;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, progressService: IProgressService, _commandService: ICommandService);
    dispose(): void;
    $startProgress(handle: number, options: IProgressOptions, extensionId?: string): Promise<void>;
    $progressReport(handle: number, message: IProgressStep): void;
    $progressEnd(handle: number): void;
    private _createTask;
}
