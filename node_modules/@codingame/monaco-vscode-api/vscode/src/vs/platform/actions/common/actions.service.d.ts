import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
import { MenuId, IMenuCreateOptions, IMenu, IMenuActionOptions, MenuItemAction, SubmenuItemAction } from "./actions.js";
export declare const IMenuService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMenuService>;
export interface IMenuService {
    readonly _serviceBrand: undefined;
    /**
    * Consider using getMenuActions if you don't need to listen to events.
    *
    * Create a new menu for the given menu identifier. A menu sends events when it's entries
    * have changed (placement, enablement, checked-state). By default it does not send events for
    * submenu entries. That is more expensive and must be explicitly enabled with the
    * `emitEventsForSubmenuChanges` flag.
    */
    createMenu(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuCreateOptions): IMenu;
    /**
    * Creates a new menu, gets the actions, and then disposes of the menu.
    */
    getMenuActions(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuActionOptions): [
        string,
        Array<MenuItemAction | SubmenuItemAction>
    ][];
    /**
    * Gets the names of the contexts that this menu listens on.
    */
    getMenuContexts(id: MenuId): ReadonlySet<string>;
    /**
    * Reset **all** menu item hidden states.
    */
    resetHiddenStates(): void;
    /**
    * Reset the menu's hidden states.
    */
    resetHiddenStates(menuIds: readonly MenuId[] | undefined): void;
}
