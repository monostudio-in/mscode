import { IHoverService } from "./hover.service.js";
import { IContextMenuService } from "../../contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.service.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.service.js";
import { ILayoutService } from "../../layout/browser/layoutService.service.js";
import { type IHoverLifecycleOptions, type IHoverOptions, type IHoverWidget, type IManagedHover, type IManagedHoverContentOrFactory, type IManagedHoverOptions } from "../../../base/browser/ui/hover/hover.js";
import type { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
export declare class HoverService extends Disposable implements IHoverService {
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _keybindingService;
    private readonly _layoutService;
    private readonly _accessibilityService;
    readonly _serviceBrand: undefined;
    /**
     * Stack of currently visible hovers. The last entry is the topmost hover.
     * This enables nested hovers where hovering inside a hover can show another hover.
     */
    private readonly _hoverStack;
    private _currentDelayedHover;
    private _currentDelayedHoverWasShown;
    private _currentDelayedHoverGroupId;
    private _lastHoverOptions;
    private readonly _delayedHovers;
    private readonly _managedHovers;
    /**
     * Gets the current (topmost) hover from the stack, if any.
     */
    private get _currentHover();
    /**
     * Gets the current (topmost) hover options from the stack, if any.
     */
    private get _currentHoverOptions();
    /**
     * Returns whether the target element is inside any of the hovers in the stack.
     * If it is, returns the index of the containing hover, otherwise returns -1.
     */
    private _getContainingHoverIndex;
    constructor(_instantiationService: IInstantiationService, _configurationService: IConfigurationService, contextMenuService: IContextMenuService, _keybindingService: IKeybindingService, _layoutService: ILayoutService, _accessibilityService: IAccessibilityService);
    showInstantHover(options: IHoverOptions, focus?: boolean, skipLastFocusedUpdate?: boolean, dontShow?: boolean): IHoverWidget | undefined;
    showDelayedHover(options: IHoverOptions, lifecycleOptions: Pick<IHoverLifecycleOptions, "groupId" | "reducedDelay">): IHoverWidget | undefined;
    setupDelayedHover(target: HTMLElement, options: (() => Omit<IHoverOptions, "target">) | Omit<IHoverOptions, "target">, lifecycleOptions?: IHoverLifecycleOptions): IDisposable;
    setupDelayedHoverAtMouse(target: HTMLElement, options: (() => Omit<IHoverOptions, "target" | "position">) | Omit<IHoverOptions, "target" | "position">, lifecycleOptions?: IHoverLifecycleOptions): IDisposable;
    private _setupDelayedHover;
    private _createHover;
    private _showHover;
    /**
     * Hides a specific hover and all hovers nested inside it.
     */
    private _hideHoverAndDescendants;
    /**
     * Hides all hovers in the stack.
     */
    private _hideAllHovers;
    hideHover(force?: boolean): void;
    private doHideHover;
    private _intersectionChange;
    showAndFocusLastHover(): void;
    private _showAndFocusHoverForActiveElement;
    private _keyDown;
    private _keyUp;
    setupManagedHover(hoverDelegate: IHoverDelegate, targetElement: HTMLElement, content: IManagedHoverContentOrFactory, options?: IManagedHoverOptions | undefined): IManagedHover;
    showManagedHover(target: HTMLElement): void;
    dispose(): void;
}
