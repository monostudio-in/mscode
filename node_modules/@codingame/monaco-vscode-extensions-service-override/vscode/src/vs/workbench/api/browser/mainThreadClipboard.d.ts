import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadClipboardShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IClipboardService } from "@codingame/monaco-vscode-api/vscode/vs/platform/clipboard/common/clipboardService.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
export declare class MainThreadClipboard implements MainThreadClipboardShape {
    private readonly _clipboardService;
    private readonly _logService;
    constructor(_context: IExtHostContext, _clipboardService: IClipboardService, _logService: ILogService);
    dispose(): void;
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}
