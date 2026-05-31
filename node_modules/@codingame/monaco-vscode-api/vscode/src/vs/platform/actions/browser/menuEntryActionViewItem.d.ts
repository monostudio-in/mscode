import { ActionViewItem, BaseActionViewItem } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from "../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IAction, IActionRunner, SubmenuAction } from "../../../base/common/actions.js";
import { Event } from "../../../base/common/event.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.service.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
import { IContextMenuService } from "../../contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.service.js";
import { INotificationService } from "../../notification/common/notification.service.js";
import { IStorageService } from "../../storage/common/storage.service.js";
import { ClickAnimation } from "../../../base/browser/ui/animations/animations.js";
import { IThemeService } from "../../theme/common/themeService.service.js";
import { MenuItemAction, SubmenuItemAction } from "../common/actions.js";
import { IMenuService } from "../common/actions.service.js";
export interface PrimaryAndSecondaryActions {
    primary: IAction[];
    secondary: IAction[];
}
export declare function getContextMenuActions(groups: ReadonlyArray<[
    string,
    ReadonlyArray<MenuItemAction | SubmenuItemAction>
]>, primaryGroup?: string): PrimaryAndSecondaryActions;
export declare function getFlatContextMenuActions(groups: ReadonlyArray<[
    string,
    ReadonlyArray<MenuItemAction | SubmenuItemAction>
]>, primaryGroup?: string): IAction[];
export declare function getActionBarActions(groups: [
    string,
    Array<MenuItemAction | SubmenuItemAction>
][], primaryGroup?: string | ((actionGroup: string) => boolean), shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): PrimaryAndSecondaryActions;
export declare function getFlatActionBarActions(groups: [
    string,
    Array<MenuItemAction | SubmenuItemAction>
][], primaryGroup?: string | ((actionGroup: string) => boolean), shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): IAction[];
export declare function fillInActionBarActions(groups: [
    string,
    Array<MenuItemAction | SubmenuItemAction>
][], target: IAction[] | PrimaryAndSecondaryActions, primaryGroup?: string | ((actionGroup: string) => boolean), shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): void;
export interface IMenuEntryActionViewItemOptions {
    readonly draggable?: boolean;
    readonly keybinding?: string | null;
    readonly hoverDelegate?: IHoverDelegate;
    readonly keybindingNotRenderedWithLabel?: boolean;
    readonly onClickAnimation?: ClickAnimation;
}
export declare class MenuEntryActionViewItem<T extends IMenuEntryActionViewItemOptions = IMenuEntryActionViewItemOptions> extends ActionViewItem {
    protected readonly _options: T | undefined;
    protected readonly _keybindingService: IKeybindingService;
    protected readonly _notificationService: INotificationService;
    protected readonly _contextKeyService: IContextKeyService;
    protected readonly _themeService: IThemeService;
    protected readonly _contextMenuService: IContextMenuService;
    private readonly _accessibilityService;
    private _wantsAltCommand;
    private readonly _itemClassDispose;
    private readonly _altKey;
    constructor(action: MenuItemAction, _options: T | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextKeyService: IContextKeyService, _themeService: IThemeService, _contextMenuService: IContextMenuService, _accessibilityService: IAccessibilityService);
    protected get _menuItemAction(): MenuItemAction;
    protected get _commandAction(): MenuItemAction;
    onClick(event: MouseEvent): Promise<void>;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    protected getTooltip(): string;
    protected updateClass(): void;
    private _updateItemClass;
}
export interface ITextOnlyMenuEntryActionViewItemOptions extends IMenuEntryActionViewItemOptions {
    readonly conversational?: boolean;
    readonly useComma?: boolean;
}
export declare class TextOnlyMenuEntryActionViewItem extends MenuEntryActionViewItem<ITextOnlyMenuEntryActionViewItemOptions> {
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    private static _symbolPrintEnter;
}
export declare class SubmenuEntryActionViewItem extends DropdownMenuActionViewItem {
    protected _keybindingService: IKeybindingService;
    protected _contextMenuService: IContextMenuService;
    protected _themeService: IThemeService;
    constructor(action: SubmenuItemAction, options: IDropdownMenuActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _contextMenuService: IContextMenuService, _themeService: IThemeService);
    render(container: HTMLElement): void;
}
export interface IDropdownWithDefaultActionViewItemOptions extends IDropdownMenuActionViewItemOptions {
    renderKeybindingWithDefaultActionLabel?: boolean;
    togglePrimaryAction?: boolean;
}
export declare class DropdownWithDefaultActionViewItem extends BaseActionViewItem {
    protected readonly _keybindingService: IKeybindingService;
    protected _notificationService: INotificationService;
    protected _contextMenuService: IContextMenuService;
    protected _menuService: IMenuService;
    protected _instaService: IInstantiationService;
    protected _storageService: IStorageService;
    private readonly _options;
    private _defaultAction;
    private readonly _defaultActionDisposables;
    private readonly _dropdown;
    private _container;
    private readonly _storageKey;
    private readonly _primaryActionListener;
    get onDidChangeDropdownVisibility(): Event<boolean>;
    constructor(submenuAction: SubmenuItemAction, options: IDropdownWithDefaultActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextMenuService: IContextMenuService, _menuService: IMenuService, _instaService: IInstantiationService, _storageService: IStorageService);
    private registerTogglePrimaryActionListener;
    private update;
    private _getDefaultActionKeybindingLabel;
    setActionContext(newContext: unknown): void;
    set actionRunner(actionRunner: IActionRunner);
    get actionRunner(): IActionRunner;
    render(container: HTMLElement): void;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
/**
 * Creates action view items for menu actions or submenu actions.
 */
export declare function createActionViewItem(instaService: IInstantiationService, action: IAction, options: IDropdownMenuActionViewItemOptions | IMenuEntryActionViewItemOptions | undefined): undefined | MenuEntryActionViewItem | SubmenuEntryActionViewItem | BaseActionViewItem;
