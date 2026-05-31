import { IViewletViewOptions } from "../../../../browser/parts/views/viewsViewlet.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.service.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.service.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.service.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.service.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { ViewPane } from "../../../../browser/parts/views/viewPane.js";
import { ILabelService } from "../../../../../platform/label/common/label.service.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { IViewDescriptorService } from "../../../../common/views.service.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.service.js";
import { ILocalizedString } from "../../../../../platform/action/common/action.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.service.js";
export declare class EmptyView extends ViewPane {
    private readonly contextService;
    private labelService;
    static readonly ID: string;
    static readonly NAME: ILocalizedString;
    private _disposed;
    constructor(options: IViewletViewOptions, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, labelService: ILabelService, contextKeyService: IContextKeyService, openerService: IOpenerService, hoverService: IHoverService);
    shouldShowWelcome(): boolean;
    protected renderBody(container: HTMLElement): void;
    private refreshTitle;
    dispose(): void;
}
