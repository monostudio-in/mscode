import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IListAccessibilityProvider, IListOptions } from "../../../../base/browser/ui/list/listWidget.js";
import { INotificationViewItem } from "../../../common/notifications.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
export interface INotificationsListOptions extends IListOptions<INotificationViewItem> {
    readonly widgetAriaLabel?: string;
}
export declare class NotificationsList extends Disposable {
    private readonly container;
    private readonly options;
    private readonly instantiationService;
    private readonly contextMenuService;
    private listContainer;
    private list;
    private listDelegate;
    private viewModel;
    private isVisible;
    constructor(container: HTMLElement, options: INotificationsListOptions, instantiationService: IInstantiationService, contextMenuService: IContextMenuService);
    show(): void;
    private createNotificationsList;
    updateNotificationsList(start: number, deleteCount: number, items?: INotificationViewItem[]): void;
    updateNotificationHeight(item: INotificationViewItem): void;
    hide(): void;
    focusFirst(): void;
    hasFocus(): boolean;
    layout(width: number, maxHeight?: number): void;
    dispose(): void;
}
export declare class NotificationAccessibilityProvider implements IListAccessibilityProvider<INotificationViewItem> {
    private readonly _options;
    private readonly _keybindingService;
    private readonly _configurationService;
    constructor(_options: INotificationsListOptions, _keybindingService: IKeybindingService, _configurationService: IConfigurationService);
    getAriaLabel(element: INotificationViewItem): string;
    getWidgetAriaLabel(): string;
    getRole(): AriaRole;
}
