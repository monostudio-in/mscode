import { IDisposable, Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IExtension, IExtensionsViewState } from "../common/extensions.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchPagedListOptions, WorkbenchAsyncDataTree, WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { IListService } from "../../../../platform/list/browser/listService.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IModalEditorPartOptions } from "../../../../platform/editor/common/editor.js";
import { Delegate } from "./extensionsList.js";
import { IListStyles } from "../../../../base/browser/ui/list/listWidget.js";
import { IStyleOverride } from "../../../../platform/theme/browser/defaultStyles.js";
import { IViewDescriptorService } from "../../../common/views.service.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IPagedModel } from "../../../../base/common/paging.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
export declare class ExtensionsList extends Disposable {
    private readonly extensionsWorkbenchService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly logService;
    readonly list: WorkbenchPagedList<IExtension>;
    private readonly contextMenuActionRunner;
    private readonly modalNavigationDisposable;
    constructor(parent: HTMLElement, viewId: string, options: Partial<IWorkbenchPagedListOptions<IExtension>>, extensionsViewState: IExtensionsViewState, extensionsWorkbenchService: IExtensionsWorkbenchService, viewDescriptorService: IViewDescriptorService, layoutService: IWorkbenchLayoutService, notificationService: INotificationService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, logService: ILogService);
    setModel(model: IPagedModel<IExtension>): void;
    layout(height?: number, width?: number): void;
    private openExtension;
    private onContextMenu;
}
export declare class ExtensionsGridView extends Disposable {
    private readonly instantiationService;
    readonly element: HTMLElement;
    private readonly renderer;
    private readonly delegate;
    private readonly disposableStore;
    constructor(parent: HTMLElement, delegate: Delegate, instantiationService: IInstantiationService);
    setExtensions(extensions: IExtension[]): void;
    private renderExtension;
}
interface IExtensionData {
    extension: IExtension;
    hasChildren: boolean;
    getChildren: () => Promise<IExtensionData[] | null>;
    parent: IExtensionData | null;
}
export declare class ExtensionsTree extends WorkbenchAsyncDataTree<IExtensionData, IExtensionData> {
    constructor(input: IExtensionData, container: HTMLElement, overrideStyles: IStyleOverride<IListStyles>, contextKeyService: IContextKeyService, listService: IListService, instantiationService: IInstantiationService, configurationService: IConfigurationService, extensionsWorkdbenchService: IExtensionsWorkbenchService);
}
export declare class ExtensionData implements IExtensionData {
    readonly extension: IExtension;
    readonly parent: IExtensionData | null;
    private readonly getChildrenExtensionIds;
    private readonly childrenExtensionIds;
    private readonly extensionsWorkbenchService;
    constructor(extension: IExtension, parent: IExtensionData | null, getChildrenExtensionIds: (extension: IExtension) => string[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    get hasChildren(): boolean;
    getChildren(): Promise<IExtensionData[] | null>;
}
export declare function getExtensions(extensions: string[], extensionsWorkbenchService: IExtensionsWorkbenchService): Promise<IExtension[]>;
/**
 * Builds modal navigation options for navigating items in a paged list model.
 */
export declare function buildModalNavigationForPagedList<T>(openedItem: T, getModel: () => IPagedModel<T> | undefined, isSame: (a: T, b: T) => boolean, openItem: (item: T, modal: IModalEditorPartOptions) => void, cancellationStore: MutableDisposable<IDisposable>, logService: ILogService): IModalEditorPartOptions | undefined;
export {};
