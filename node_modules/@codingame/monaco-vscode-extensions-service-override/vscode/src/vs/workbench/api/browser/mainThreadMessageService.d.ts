import Severity from "@codingame/monaco-vscode-api/vscode/vs/base/common/severity";
import { MainThreadMessageServiceShape, MainThreadMessageOptions } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDialogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
export declare class MainThreadMessageService implements MainThreadMessageServiceShape {
    private readonly _notificationService;
    private readonly _commandService;
    private readonly _dialogService;
    private extensionsListener;
    private static readonly URGENT_NOTIFICATION_SOURCES;
    constructor(extHostContext: IExtHostContext, _notificationService: INotificationService, _commandService: ICommandService, _dialogService: IDialogService, extensionService: IExtensionService);
    dispose(): void;
    $showMessage(severity: Severity, message: string, options: MainThreadMessageOptions, commands: {
        title: string;
        isCloseAffordance: boolean;
        handle: number;
    }[]): Promise<number | undefined>;
    private _showMessage;
    private _showModalMessage;
}
