import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { type MainThreadTerminalShellIntegrationShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ITerminalService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/terminal/browser/terminal.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
export declare class MainThreadTerminalShellIntegration extends Disposable implements MainThreadTerminalShellIntegrationShape {
    private readonly _terminalService;
    private readonly _extensionService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _terminalService: ITerminalService, workbenchEnvironmentService: IWorkbenchEnvironmentService, _extensionService: IExtensionService);
    $executeCommand(terminalId: number, commandLine: string): void;
    private _enableShellIntegration;
}
