import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { IExtension, IExtensionContainer, IExtensionsViewState } from "../common/extensions.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IExtensionIgnoredRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.service.js";
import { IExtensionRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.service.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { ExtensionStatusAction } from "./extensionsActions.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Event } from "../../../../base/common/event.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import type { IManagedHover } from "../../../../base/browser/ui/hover/hover.js";
import { IExtensionFeaturesManagementService } from "../../../services/extensionManagement/common/extensionFeatures.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IExplorerService } from "../../files/browser/files.service.js";
import { IViewsService } from "../../../services/views/common/viewsService.service.js";
import { IExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.service.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.service.js";
export declare abstract class ExtensionWidget extends Disposable implements IExtensionContainer {
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    update(): void;
    abstract render(): void;
}
export declare function onClick(element: HTMLElement, callback: () => void): IDisposable;
export declare class ExtensionIconWidget extends ExtensionWidget {
    private readonly iconLoadingDisposable;
    private readonly iconErrorDisposable;
    private readonly element;
    private readonly iconElement;
    private readonly defaultIconElement;
    private iconUrl;
    constructor(container: HTMLElement);
    private clear;
    render(): void;
}
export declare class InstallCountWidget extends ExtensionWidget {
    readonly container: HTMLElement;
    private small;
    private readonly hoverService;
    private readonly disposables;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService);
    private clear;
    render(): void;
    static getInstallLabel(extension: IExtension, small: boolean): string | undefined;
}
export declare class RatingsWidget extends ExtensionWidget {
    readonly container: HTMLElement;
    private small;
    private readonly hoverService;
    private readonly openerService;
    private containerHover;
    private readonly disposables;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService, openerService: IOpenerService);
    private clear;
    render(): void;
}
export declare class PublisherWidget extends ExtensionWidget {
    readonly container: HTMLElement;
    private small;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly openerService;
    private element;
    private containerHover;
    private readonly disposables;
    constructor(container: HTMLElement, small: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, openerService: IOpenerService);
    private clear;
    render(): void;
}
export declare class SponsorWidget extends ExtensionWidget {
    readonly container: HTMLElement;
    private readonly hoverService;
    private readonly openerService;
    private readonly disposables;
    constructor(container: HTMLElement, hoverService: IHoverService, openerService: IOpenerService);
    render(): void;
}
export declare class RecommendationWidget extends ExtensionWidget {
    private parent;
    private readonly extensionRecommendationsService;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService);
    private clear;
    render(): void;
}
export declare class PreReleaseBookmarkWidget extends ExtensionWidget {
    private parent;
    private element?;
    private readonly disposables;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class RemoteBadgeWidget extends ExtensionWidget {
    private readonly tooltip;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    private readonly remoteBadge;
    private element;
    constructor(parent: HTMLElement, tooltip: boolean, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService);
    private clear;
    render(): void;
}
export declare class ExtensionIconBadge extends Disposable {
    private readonly icon;
    private readonly tooltip;
    private readonly labelService;
    private readonly themeService;
    readonly element: HTMLElement;
    readonly elementHover: IManagedHover;
    constructor(icon: ThemeIcon, tooltip: string | undefined, hoverService: IHoverService, labelService: ILabelService, themeService: IThemeService);
    private render;
}
export declare class ExtensionPackCountWidget extends ExtensionWidget {
    private readonly parent;
    private element;
    private countBadge;
    constructor(parent: HTMLElement);
    private clear;
    render(): void;
}
export declare class ExtensionKindIndicatorWidget extends ExtensionWidget {
    readonly container: HTMLElement;
    private small;
    private readonly hoverService;
    private readonly contextService;
    private readonly uriIdentityService;
    private readonly explorerService;
    private readonly viewsService;
    private element;
    private extensionGalleryManifest;
    private readonly disposables;
    constructor(container: HTMLElement, small: boolean, hoverService: IHoverService, contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, explorerService: IExplorerService, viewsService: IViewsService, extensionGalleryManifestService: IExtensionGalleryManifestService);
    private clear;
    render(): void;
}
export declare class SyncIgnoredWidget extends ExtensionWidget {
    private readonly container;
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly hoverService;
    private readonly userDataSyncEnablementService;
    private readonly disposables;
    constructor(container: HTMLElement, configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, hoverService: IHoverService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    render(): void;
}
export declare class ExtensionRestartRequiredWidget extends ExtensionWidget {
    private readonly container;
    private readonly hoverService;
    private readonly disposables;
    constructor(container: HTMLElement, hoverService: IHoverService);
    render(): void;
}
export declare class ExtensionRuntimeStatusWidget extends ExtensionWidget {
    private readonly extensionViewState;
    private readonly container;
    private readonly extensionFeaturesManagementService;
    private readonly extensionsWorkbenchService;
    constructor(extensionViewState: IExtensionsViewState, container: HTMLElement, extensionService: IExtensionService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    render(): void;
}
export type ExtensionHoverOptions = {
    position: () => HoverPosition;
    readonly target: HTMLElement;
};
export declare class ExtensionHoverWidget extends ExtensionWidget {
    private readonly options;
    private readonly extensionStatusAction;
    private readonly extensionsWorkbenchService;
    private readonly extensionFeaturesManagementService;
    private readonly hoverService;
    private readonly configurationService;
    private readonly extensionRecommendationsService;
    private readonly themeService;
    private readonly contextService;
    private readonly hover;
    constructor(options: ExtensionHoverOptions, extensionStatusAction: ExtensionStatusAction, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, hoverService: IHoverService, configurationService: IConfigurationService, extensionRecommendationsService: IExtensionRecommendationsService, themeService: IThemeService, contextService: IWorkspaceContextService);
    render(): void;
    private getHoverMarkdown;
    private getRecommendationMessage;
    static getPreReleaseMessage(extension: IExtension): string | undefined;
}
export declare class ExtensionStatusWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionStatusAction;
    private readonly markdownRendererService;
    private readonly renderDisposables;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionStatusAction: ExtensionStatusAction, markdownRendererService: IMarkdownRendererService);
    render(): void;
}
export declare class ExtensionRecommendationWidget extends ExtensionWidget {
    private readonly container;
    private readonly extensionRecommendationsService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly _onDidRender;
    readonly onDidRender: Event<void>;
    constructor(container: HTMLElement, extensionRecommendationsService: IExtensionRecommendationsService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService);
    render(): void;
    private getRecommendationStatus;
}
export declare const extensionRatingIconColor: string;
export declare const extensionPreReleaseIconColor: string;
export declare const extensionSponsorIconColor: string;
export declare const extensionPrivateBadgeBackground: string;
