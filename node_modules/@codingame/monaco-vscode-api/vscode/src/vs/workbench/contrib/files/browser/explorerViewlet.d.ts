import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ExplorerView } from "./views/explorerView.js";
import { OpenEditorsView } from "./views/openEditorsView.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IViewDescriptor, ViewContainer } from "../../../common/views.js";
import { IViewDescriptorService } from "../../../common/views.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.service.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IProgressService } from "../../../../platform/progress/common/progress.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
export declare class ExplorerViewletViewsContribution extends Disposable implements IWorkbenchContribution {
    private readonly workspaceContextService;
    static readonly ID = "workbench.contrib.explorerViewletViews";
    constructor(workspaceContextService: IWorkspaceContextService, progressService: IProgressService);
    private registerViews;
    private createOpenEditorsViewDescriptor;
    private createEmptyViewDescriptor;
    private createExplorerViewDescriptor;
}
export declare class ExplorerViewPaneContainer extends ViewPaneContainer {
    private viewletVisibleContextKey;
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, contextService: IWorkspaceContextService, storageService: IStorageService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService, logService: ILogService);
    create(parent: HTMLElement): void;
    protected createView(viewDescriptor: IViewDescriptor, options: IViewletViewOptions): ViewPane;
    getExplorerView(): ExplorerView;
    getOpenEditorsView(): OpenEditorsView;
    setVisible(visible: boolean): void;
    focus(): void;
}
/**
 * Explorer viewlet container.
 */
export declare const VIEW_CONTAINER: ViewContainer;
