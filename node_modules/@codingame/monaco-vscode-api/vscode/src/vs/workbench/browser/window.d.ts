import { Disposable } from "../../base/common/lifecycle.js";
import { IDialogService } from "../../platform/dialogs/common/dialogs.service.js";
import { IInstantiationService, ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../platform/label/common/label.service.js";
import { IOpenerService } from "../../platform/opener/common/opener.service.js";
import { IProductService } from "../../platform/product/common/productService.service.js";
import { IBrowserWorkbenchEnvironmentService } from "../services/environment/browser/environmentService.service.js";
import { IWorkbenchLayoutService } from "../services/layout/browser/layoutService.service.js";
import { BrowserLifecycleService } from "@codingame/monaco-vscode-lifecycle-service-override/vscode/vs/workbench/services/lifecycle/browser/lifecycleService";
import { ShutdownReason } from "../services/lifecycle/common/lifecycle.js";
import { IHostService } from "../services/host/browser/host.service.js";
import { CodeWindow } from "../../base/browser/window.js";
import { IWorkbenchEnvironmentService } from "../services/environment/common/environmentService.service.js";
import { IContextMenuService } from "../../platform/contextview/browser/contextView.service.js";
export declare abstract class BaseWindow extends Disposable {
    protected readonly hostService: IHostService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly layoutService: IWorkbenchLayoutService;
    private static TIMEOUT_HANDLES;
    private static readonly TIMEOUT_DISPOSABLES;
    constructor(targetWindow: CodeWindow, dom: {
        getWindowsCount: () => number;
        getWindows: () => Iterable<import("../../base/browser/dom.js").IRegisteredCodeWindow>;
    } | undefined, /* for testing */ hostService: IHostService, environmentService: IWorkbenchEnvironmentService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService);
    protected enableWindowFocusOnElementFocus(targetWindow: CodeWindow): void;
    private onElementFocus;
    protected enableMultiWindowAwareTimeout(targetWindow: Window, dom?: {
        getWindowsCount: () => number;
        getWindows: () => Iterable<import("../../base/browser/dom.js").IRegisteredCodeWindow>;
    }): void;
    static confirmOnShutdown(accessor: ServicesAccessor, reason: ShutdownReason): Promise<boolean>;
    private registerFullScreenListeners;
    private registerContextMenuListeners;
}
export declare class BrowserWindow extends BaseWindow {
    private readonly openerService;
    private readonly lifecycleService;
    private readonly dialogService;
    private readonly labelService;
    private readonly productService;
    private readonly browserEnvironmentService;
    private readonly instantiationService;
    constructor(openerService: IOpenerService, lifecycleService: BrowserLifecycleService, dialogService: IDialogService, labelService: ILabelService, productService: IProductService, browserEnvironmentService: IBrowserWorkbenchEnvironmentService, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, hostService: IHostService, contextMenuService: IContextMenuService);
    private registerListeners;
    private onWillShutdown;
    private create;
    private setupDriver;
    private setupOpenHandlers;
    private registerLabelFormatters;
    private registerCommands;
}
