import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { MainThreadDiaglogsShape, MainThreadDialogOpenOptions, MainThreadDialogSaveOptions } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IFileDialogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service";
export declare class MainThreadDialogs implements MainThreadDiaglogsShape {
    private readonly _fileDialogService;
    constructor(context: IExtHostContext, _fileDialogService: IFileDialogService);
    dispose(): void;
    $showOpenDialog(options?: MainThreadDialogOpenOptions): Promise<URI[] | undefined>;
    $showSaveDialog(options?: MainThreadDialogSaveOptions): Promise<URI | undefined>;
    private static _convertOpenOptions;
    private static _convertSaveOptions;
}
