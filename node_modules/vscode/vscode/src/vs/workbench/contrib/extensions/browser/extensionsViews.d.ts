import { Event } from "../../../../base/common/event.js";
import { IPagedModel, IPager } from "../../../../base/common/paging.js";
import { IQueryOptions as IGalleryQueryOptions, SortBy as GallerySortBy } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IExtensionManagementServer } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IWorkbenchExtensionManagementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IExtensionRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IExtension, IWorkspaceRecommendedExtensionsView } from "../common/extensions.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IProductService } from "../../../../platform/product/common/productService.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IViewDescriptorService } from "../../../common/views.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IExtensionManifestPropertiesService } from "../../../services/extensions/common/extensionManifestPropertiesService.service.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IExtensionFeaturesManagementService } from "../../../services/extensionManagement/common/extensionFeatures.service.js";
import { URI } from "../../../../base/common/uri.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
export declare const NONE_CATEGORY = "none";
export interface ExtensionsListViewOptions {
    server?: IExtensionManagementServer;
    flexibleHeight?: boolean;
    readonly onDidChangeTitle?: Event<string>;
    hideBadge?: boolean;
}
declare enum LocalSortBy {
    UpdateDate = "UpdateDate"
}
type SortBy = LocalSortBy | GallerySortBy;
type IQueryOptions = Omit<IGalleryQueryOptions, "sortBy"> & {
    sortBy?: SortBy;
};
export declare abstract class AbstractExtensionsListView<T> extends ViewPane {
    abstract show(query: string, refresh?: boolean): Promise<IPagedModel<T>>;
}
export declare class ExtensionsListView extends AbstractExtensionsListView<IExtension> {
    protected readonly options: ExtensionsListViewOptions;
    protected notificationService: INotificationService;
    private readonly extensionService;
    protected extensionsWorkbenchService: IExtensionsWorkbenchService;
    protected extensionRecommendationsService: IExtensionRecommendationsService;
    protected readonly telemetryService: ITelemetryService;
    protected contextService: IWorkspaceContextService;
    protected readonly extensionManagementServerService: IExtensionManagementServerService;
    private readonly extensionManifestPropertiesService;
    protected readonly extensionManagementService: IWorkbenchExtensionManagementService;
    protected readonly workspaceService: IWorkspaceContextService;
    protected readonly productService: IProductService;
    private readonly storageService;
    private readonly workspaceTrustManagementService;
    private readonly extensionEnablementService;
    private readonly extensionFeaturesManagementService;
    protected readonly uriIdentityService: IUriIdentityService;
    private readonly logService;
    private static RECENT_UPDATE_DURATION;
    private bodyTemplate;
    private badge;
    private list;
    private queryRequest;
    private queryResult;
    private extensionsViewState;
    private readonly contextMenuActionRunner;
    constructor(options: ExtensionsListViewOptions, viewletViewOptions: IViewletViewOptions, notificationService: INotificationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionRecommendationsService: IExtensionRecommendationsService, telemetryService: ITelemetryService, hoverService: IHoverService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionManagementService: IWorkbenchExtensionManagementService, workspaceService: IWorkspaceContextService, productService: IProductService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, storageService: IStorageService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, uriIdentityService: IUriIdentityService, logService: ILogService);
    protected registerActions(): void;
    protected renderHeader(container: HTMLElement): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    show(query: string, refresh?: boolean): Promise<IPagedModel<IExtension>>;
    count(): number;
    protected showEmptyModel(): Promise<IPagedModel<IExtension>>;
    private query;
    private queryByIds;
    private queryLocal;
    private filterLocal;
    private filterBuiltinExtensions;
    private filterExtensionByCategory;
    private parseCategories;
    private filterInstalledExtensions;
    private filterOutdatedExtensions;
    private filterDisabledExtensions;
    private filterEnabledExtensions;
    private filterWorkspaceUnsupportedExtensions;
    private filterDeprecatedExtensions;
    private filterRecentlyUpdatedExtensions;
    private filterRestartRequiredExtensions;
    private filterExtensionsByFeature;
    private mergeAddedExtensions;
    private queryGallery;
    private getPreferredExtensions;
    private sortExtensions;
    private isRecommendationsQuery;
    private queryRecommendations;
    protected getInstallableRecommendations(recommendations: Array<string | URI>, options: IQueryOptions, token: CancellationToken): Promise<IExtension[]>;
    protected getWorkspaceRecommendations(): Promise<Array<string | URI>>;
    private getWorkspaceRecommendationsModel;
    private getKeymapRecommendationsModel;
    private getLanguageRecommendationsModel;
    private getRemoteRecommendationsModel;
    private getExeRecommendationsModel;
    private getOtherRecommendationsModel;
    private getOtherRecommendations;
    private getAllRecommendationsModel;
    private searchRecommendations;
    private setModel;
    private updateModel;
    private updateBody;
    private getMessage;
    private isOfflineError;
    protected updateSize(): void;
    dispose(): void;
    static isLocalExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInGroupExtensionsQuery(query: string): boolean;
    static isSearchWorkspaceUnsupportedExtensionsQuery(query: string): boolean;
    static isInstalledExtensionsQuery(query: string): boolean;
    static isSearchInstalledExtensionsQuery(query: string): boolean;
    static isOutdatedExtensionsQuery(query: string): boolean;
    static isEnabledExtensionsQuery(query: string): boolean;
    static isDisabledExtensionsQuery(query: string): boolean;
    static isSearchDeprecatedExtensionsQuery(query: string): boolean;
    static isRecommendedExtensionsQuery(query: string): boolean;
    static isSearchRecommendedExtensionsQuery(query: string): boolean;
    static isWorkspaceRecommendedExtensionsQuery(query: string): boolean;
    static isExeRecommendedExtensionsQuery(query: string): boolean;
    static isRemoteRecommendedExtensionsQuery(query: string): boolean;
    static isKeymapsRecommendedExtensionsQuery(query: string): boolean;
    static isLanguageRecommendedExtensionsQuery(query: string): boolean;
    static isSortInstalledExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchPopularQuery(query: string): boolean;
    static isSearchRecentlyPublishedQuery(query: string): boolean;
    static isSearchRecentlyUpdatedQuery(query: string): boolean;
    static isRestartRequiredQuery(query: string): boolean;
    static isSearchExtensionUpdatesQuery(query: string): boolean;
    static isSortUpdateDateQuery(query: string): boolean;
    static isFeatureExtensionsQuery(query: string): boolean;
    focus(): void;
}
export declare class DefaultPopularExtensionsView extends ExtensionsListView {
    show(): Promise<IPagedModel<IExtension>>;
}
export declare class ServerInstalledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class EnabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DisabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class OutdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
    protected updateSize(): void;
}
export declare class RecentlyUpdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export interface StaticQueryExtensionsViewOptions extends ExtensionsListViewOptions {
    readonly query: string;
}
export declare class StaticQueryExtensionsView extends ExtensionsListView {
    protected readonly options: StaticQueryExtensionsViewOptions;
    constructor(options: StaticQueryExtensionsViewOptions, viewletViewOptions: IViewletViewOptions, notificationService: INotificationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionRecommendationsService: IExtensionRecommendationsService, telemetryService: ITelemetryService, hoverService: IHoverService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionManagementService: IWorkbenchExtensionManagementService, workspaceService: IWorkspaceContextService, productService: IProductService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, storageService: IStorageService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, uriIdentityService: IUriIdentityService, logService: ILogService);
    show(): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DeprecatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class SearchMarketplaceExtensionsView extends ExtensionsListView {
    private readonly reportSearchFinishedDelayer;
    private searchWaitPromise;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private reportSearchFinished;
}
export declare class DefaultRecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class RecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class WorkspaceRecommendedExtensionsView extends ExtensionsListView implements IWorkspaceRecommendedExtensionsView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private getInstallableWorkspaceRecommendations;
    installWorkspaceRecommendations(): Promise<void>;
}
export declare class PreferredExtensionsPagedModel implements IPagedModel<IExtension> {
    private readonly preferredExtensions;
    private readonly pager;
    private readonly resolved;
    private preferredGalleryExtensions;
    private resolvedGalleryExtensionsFromQuery;
    private readonly pages;
    readonly length: number;
    get onDidIncrementLength(): Event<number>;
    constructor(preferredExtensions: IExtension[], pager: IPager<IExtension>);
    isResolved(index: number): boolean;
    get(index: number): IExtension;
    resolve(index: number, cancellationToken: CancellationToken): Promise<IExtension>;
    private populateResolvedExtensions;
}
export {};
