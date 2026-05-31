import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IPagedRenderer } from "../../../../base/browser/ui/list/listPaging.js";
import { IExtension, IExtensionsViewState } from "../common/extensions.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
export interface ITemplateData {
    root: HTMLElement;
    element: HTMLElement;
    name: HTMLElement;
    description: HTMLElement;
    installCount: HTMLElement;
    ratings: HTMLElement;
    extension: IExtension | null;
    disposables: IDisposable[];
    extensionDisposables: IDisposable[];
    actionbar: ActionBar;
}
export declare class Delegate implements IListVirtualDelegate<IExtension> {
    getHeight(): number;
    getTemplateId(): string;
}
export type ExtensionListRendererOptions = {
    hoverOptions: {
        position: () => HoverPosition;
    };
};
export declare class Renderer implements IPagedRenderer<IExtension, ITemplateData> {
    private readonly extensionViewState;
    private readonly options;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly contextMenuService;
    constructor(extensionViewState: IExtensionsViewState, options: ExtensionListRendererOptions, instantiationService: IInstantiationService, notificationService: INotificationService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, contextMenuService: IContextMenuService);
    get templateId(): string;
    renderTemplate(root: HTMLElement): ITemplateData;
    renderPlaceholder(index: number, data: ITemplateData): void;
    renderElement(extension: IExtension, index: number, data: ITemplateData): void;
    disposeElement(extension: IExtension, index: number, data: ITemplateData): void;
    disposeTemplate(data: ITemplateData): void;
}
