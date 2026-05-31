import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IMenuService } from "../../../../platform/actions/common/actions.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
export interface ISuggestWidgetStatusOptions {
    /**
     * Whether to show icons instead of text where possible and avoid
     * keybindings all together.
     */
    readonly showIconsNoKeybindings?: boolean;
}
export declare class SuggestWidgetStatus {
    private readonly _menuId;
    private _menuService;
    private _contextKeyService;
    readonly element: HTMLElement;
    private readonly _leftActions;
    private readonly _rightActions;
    private readonly _menuDisposables;
    constructor(container: HTMLElement, _menuId: MenuId, options: ISuggestWidgetStatusOptions | undefined, instantiationService: IInstantiationService, _menuService: IMenuService, _contextKeyService: IContextKeyService);
    dispose(): void;
    show(): void;
    hide(): void;
}
