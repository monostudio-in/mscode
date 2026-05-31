import { SerializedError } from "@codingame/monaco-vscode-api/vscode/vs/base/common/errors";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { MainThreadExtensionServiceShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtensionsWorkbenchService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/extensions/common/extensions.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { IWorkbenchExtensionEnablementService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/common/extensionManagement.service";
import { ExtensionActivationReason, MissingExtensionDependency } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IHostService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/host/browser/host.service";
import { ITimerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/timer/browser/timerService.service";
export declare class MainThreadExtensionService implements MainThreadExtensionServiceShape {
    private readonly _extensionService;
    private readonly _notificationService;
    private readonly _extensionsWorkbenchService;
    private readonly _hostService;
    private readonly _extensionEnablementService;
    private readonly _timerService;
    private readonly _commandService;
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _extensionHostKind;
    private readonly _internalExtensionService;
    constructor(extHostContext: IExtHostContext, _extensionService: IExtensionService, _notificationService: INotificationService, _extensionsWorkbenchService: IExtensionsWorkbenchService, _hostService: IHostService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _timerService: ITimerService, _commandService: ICommandService, _environmentService: IWorkbenchEnvironmentService);
    dispose(): void;
    $getExtension(extensionId: string): Promise<Readonly<import("@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions").IRelaxedExtensionDescription> | undefined>;
    $activateExtension(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    $onWillActivateExtension(extensionId: ExtensionIdentifier): Promise<void>;
    $onDidActivateExtension(extensionId: ExtensionIdentifier, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason): void;
    $onExtensionRuntimeError(extensionId: ExtensionIdentifier, data: SerializedError): void;
    $onExtensionActivationError(extensionId: ExtensionIdentifier, data: SerializedError, missingExtensionDependency: MissingExtensionDependency | null): Promise<void>;
    private _handleMissingInstalledDependency;
    private _handleMissingNotInstalledDependency;
    $setPerformanceMarks(marks: PerformanceMark[]): Promise<void>;
    $asBrowserUri(uri: UriComponents): Promise<UriComponents>;
    $getAllStaticBrowserUris(): Promise<[
        UriComponents,
        UriComponents
    ][]>;
}
