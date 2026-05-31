import { ActionViewItem, IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action, IAction, IActionChangeEvent } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.service.js";
import { IAuthenticationQueryService } from "../../../services/authentication/common/authenticationQuery.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.service.js";
import { IMcpServerContainer, IWorkbenchMcpServer } from "../common/mcpTypes.js";
import { IMcpSamplingService } from "../common/mcpTypes.service.js";
import { IMcpWorkbenchService } from "../common/mcpTypes.service.js";
import { IMcpService } from "../common/mcpTypes.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { ExtensionAction } from "../../extensions/browser/extensionsActions.js";
import { ActionWithDropdownActionViewItem, IActionWithDropdownActionViewItemOptions } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { IContextMenuProvider } from "../../../../base/browser/contextmenu.js";
export interface IMcpServerActionChangeEvent extends IActionChangeEvent {
    readonly hidden?: boolean;
    readonly menuActions?: IAction[];
}
export declare abstract class McpServerAction extends Action implements IMcpServerContainer {
    protected _onDidChange: Emitter<IMcpServerActionChangeEvent>;
    get onDidChange(): Event<IMcpServerActionChangeEvent>;
    static readonly EXTENSION_ACTION_CLASS = "extension-action";
    static readonly TEXT_ACTION_CLASS: string;
    static readonly LABEL_ACTION_CLASS: string;
    static readonly PROMINENT_LABEL_ACTION_CLASS: string;
    static readonly ICON_ACTION_CLASS: string;
    private _hidden;
    get hidden(): boolean;
    set hidden(hidden: boolean);
    protected _setEnabled(value: boolean): void;
    protected hideOnDisabled: boolean;
    private _mcpServer;
    get mcpServer(): IWorkbenchMcpServer | null;
    set mcpServer(mcpServer: IWorkbenchMcpServer | null);
    abstract update(): void;
}
export declare class ButtonWithDropDownExtensionAction extends McpServerAction {
    private readonly actionsGroups;
    private primaryAction;
    readonly menuActionClassNames: string[];
    private _menuActions;
    get menuActions(): IAction[];
    get mcpServer(): IWorkbenchMcpServer | null;
    set mcpServer(mcpServer: IWorkbenchMcpServer | null);
    protected readonly actions: McpServerAction[];
    constructor(id: string, clazz: string, actionsGroups: McpServerAction[][]);
    update(donotUpdateActions?: boolean): void;
    run(): Promise<void>;
    protected getLabel(action: ExtensionAction): string;
}
export declare class ButtonWithDropdownExtensionActionViewItem extends ActionWithDropdownActionViewItem {
    constructor(action: ButtonWithDropDownExtensionAction, options: IActionViewItemOptions & IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    protected updateClass(): void;
}
export declare abstract class DropDownAction extends McpServerAction {
    protected instantiationService: IInstantiationService;
    constructor(id: string, label: string, cssClass: string, enabled: boolean, instantiationService: IInstantiationService);
    private _actionViewItem;
    createActionViewItem(options: IActionViewItemOptions): DropDownExtensionActionViewItem;
    run(actionGroups: IAction[][]): Promise<void>;
}
export declare class DropDownExtensionActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: IAction, options: IActionViewItemOptions, contextMenuService: IContextMenuService);
    showMenu(menuActionGroups: IAction[][]): void;
    private getActions;
}
export declare class InstallAction extends McpServerAction {
    private readonly open;
    private readonly mcpWorkbenchService;
    private readonly telemetryService;
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(open: boolean, mcpWorkbenchService: IMcpWorkbenchService, telemetryService: ITelemetryService, mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
}
export declare class InstallInWorkspaceAction extends McpServerAction {
    private readonly open;
    private readonly mcpWorkbenchService;
    private readonly workspaceService;
    private readonly quickInputService;
    private readonly telemetryService;
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(open: boolean, mcpWorkbenchService: IMcpWorkbenchService, workspaceService: IWorkspaceContextService, quickInputService: IQuickInputService, telemetryService: ITelemetryService, mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
    private getConfigurationTarget;
}
export declare class InstallInRemoteAction extends McpServerAction {
    private readonly open;
    private readonly mcpWorkbenchService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly labelService;
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(open: boolean, mcpWorkbenchService: IMcpWorkbenchService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService, labelService: ILabelService, mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
}
export declare class InstallingLabelAction extends McpServerAction {
    private static readonly LABEL;
    private static readonly CLASS;
    constructor();
    update(): void;
}
export declare class UninstallAction extends McpServerAction {
    private readonly mcpWorkbenchService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpWorkbenchService: IMcpWorkbenchService);
    update(): void;
    run(): Promise<void>;
}
export declare class EnableMcpServerGloballyAction extends McpServerAction {
    private readonly mcpService;
    static readonly ID = "mcpServer.enableGlobally";
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
}
export declare class EnableMcpServerForWorkspaceAction extends McpServerAction {
    private readonly mcpService;
    private readonly workspaceService;
    static readonly ID = "mcpServer.enableForWorkspace";
    constructor(mcpService: IMcpService, workspaceService: IWorkspaceContextService);
    update(): void;
    run(): Promise<void>;
}
export declare class DisableMcpServerGloballyAction extends McpServerAction {
    private readonly mcpService;
    static readonly ID = "mcpServer.disableGlobally";
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
}
export declare class DisableMcpServerForWorkspaceAction extends McpServerAction {
    private readonly mcpService;
    private readonly workspaceService;
    static readonly ID = "mcpServer.disableForWorkspace";
    constructor(mcpService: IMcpService, workspaceService: IWorkspaceContextService);
    update(): void;
    run(): Promise<void>;
}
export declare class EnableMcpDropDownAction extends ButtonWithDropDownExtensionAction {
    constructor(instantiationService: IInstantiationService);
}
export declare class DisableMcpDropDownAction extends ButtonWithDropDownExtensionAction {
    constructor(instantiationService: IInstantiationService);
}
export declare function getContextMenuActions(mcpServer: IWorkbenchMcpServer, isEditorAction: boolean, instantiationService: IInstantiationService): IAction[][];
export declare class ManageMcpServerAction extends DropDownAction {
    private readonly isEditorAction;
    static readonly ID = "mcpServer.manage";
    private static readonly Class;
    private static readonly HideManageExtensionClass;
    constructor(isEditorAction: boolean, instantiationService: IInstantiationService);
    run(): Promise<void>;
    update(): void;
}
export declare class StartServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class StopServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class RestartServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class AuthServerAction extends McpServerAction {
    private readonly mcpService;
    private readonly _authenticationQueryService;
    private readonly _authenticationService;
    static readonly CLASS: string;
    private static readonly HIDE;
    private static readonly SIGN_OUT;
    private static readonly DISCONNECT;
    private _accountQuery;
    constructor(mcpService: IMcpService, _authenticationQueryService: IAuthenticationQueryService, _authenticationService: IAuthenticationService);
    update(): void;
    run(): Promise<void>;
    private getServer;
    private getAccountQuery;
}
export declare class ShowServerOutputAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class ShowServerConfigurationAction extends McpServerAction {
    private readonly mcpWorkbenchService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpWorkbenchService: IMcpWorkbenchService);
    update(): void;
    run(): Promise<void>;
}
export declare class ShowServerJsonConfigurationAction extends McpServerAction {
    private readonly mcpService;
    private readonly mcpRegistry;
    private readonly editorService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, mcpRegistry: IMcpRegistry, editorService: IEditorService);
    update(): void;
    run(): Promise<void>;
    private getConfigurationTarget;
}
export declare class ConfigureModelAccessAction extends McpServerAction {
    private readonly mcpService;
    private readonly commandService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, commandService: ICommandService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class ShowSamplingRequestsAction extends McpServerAction {
    private readonly mcpService;
    private readonly samplingService;
    private readonly editorService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, samplingService: IMcpSamplingService, editorService: IEditorService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export declare class BrowseResourcesAction extends McpServerAction {
    private readonly mcpService;
    private readonly commandService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, commandService: ICommandService);
    update(): void;
    run(): Promise<void>;
    private getServer;
}
export type McpServerStatus = {
    readonly message: IMarkdownString;
    readonly icon?: ThemeIcon;
};
export declare class McpServerStatusAction extends McpServerAction {
    private readonly mcpWorkbenchService;
    private readonly commandService;
    private static readonly CLASS;
    private _status;
    get status(): McpServerStatus[];
    private readonly _onDidChangeStatus;
    readonly onDidChangeStatus: Event<void>;
    constructor(mcpWorkbenchService: IMcpWorkbenchService, commandService: ICommandService);
    update(): void;
    private computeAndUpdateStatus;
    private updateStatus;
    run(): Promise<void>;
}
