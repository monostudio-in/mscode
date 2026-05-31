import { IContextViewService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.service.js";
export declare const viewFilterSubmenu: MenuId;
export interface IFilterWidgetOptions {
    readonly text?: string;
    readonly placeholder?: string;
    readonly ariaLabel?: string;
    readonly history?: string[];
    readonly focusContextKey?: string;
}
export declare class FilterWidget extends Widget {
    private readonly options;
    private readonly instantiationService;
    private readonly contextViewService;
    private readonly keybindingService;
    private readonly configurationService;
    private readonly accessibilityService;
    readonly element: HTMLElement;
    private readonly delayedFilterUpdate;
    private readonly filterInputBox;
    private readonly filterBadge;
    private readonly toolbar;
    private readonly focusContextKey;
    private readonly _onDidChangeFilterText;
    readonly onDidChangeFilterText: import("../../../../base/common/event.js").Event<string>;
    private readonly _onDidAcceptFilterText;
    readonly onDidAcceptFilterText: import("../../../../base/common/event.js").Event<void>;
    private moreFiltersActionViewItem;
    private isMoreFiltersChecked;
    private lastWidth?;
    /**
     * Tracks whether the accessibility help hint has been announced in the ARIA label.
     * Reset when the widget loses focus, allowing the hint to be announced again
     * on the next focus.
     */
    private _accessibilityHelpHintAnnounced;
    private _labelResetTimeout;
    private readonly focusTracker;
    get onDidFocus(): import("../../../../base/common/event.js").Event<void>;
    get onDidBlur(): import("../../../../base/common/event.js").Event<void>;
    constructor(options: IFilterWidgetOptions, instantiationService: IInstantiationService, contextViewService: IContextViewService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService);
    hasFocus(): boolean;
    focus(): void;
    /**
     * Updates the ARIA label of the filter input box.
     * When a screen reader is active and the accessibility verbosity setting is enabled,
     * includes a hint about pressing Alt+F1 for accessibility help on first focus.
     * The hint is only announced once per focus cycle to prevent double-speak.
     */
    private _updateFilterInputAriaLabel;
    blur(): void;
    updateBadge(message: string | undefined): void;
    setFilterText(filterText: string): void;
    getFilterText(): string;
    getHistory(): string[];
    layout(width: number): void;
    relayout(): void;
    checkMoreFilters(checked: boolean): void;
    private createInput;
    private createBadge;
    private createToolBar;
    private onDidInputChange;
    private adjustInputBox;
    private handleKeyboardEvent;
    private onInputKeyDown;
}
