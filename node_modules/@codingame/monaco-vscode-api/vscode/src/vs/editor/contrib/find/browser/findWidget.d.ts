import { IKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { IContextViewProvider } from "../../../../base/browser/ui/contextview/contextview.js";
import { IVerticalSashLayoutProvider, Sash } from "../../../../base/browser/ui/sash/sash.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone } from "../../../browser/editorBrowser.js";
import { FindReplaceState } from "./findState.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { IHistory } from "../../../../base/common/history.js";
import { type IHoverLifecycleOptions } from "../../../../base/browser/ui/hover/hover.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
export declare const findSelectionIcon: ThemeIcon;
export declare const findReplaceIcon: ThemeIcon;
export declare const findReplaceAllIcon: ThemeIcon;
export declare const findPreviousMatchIcon: ThemeIcon;
export declare const findNextMatchIcon: ThemeIcon;
export interface IFindController {
    replace(): void;
    replaceAll(): void;
    getGlobalBufferTerm(): Promise<string>;
}
export declare const NLS_MATCHES_LOCATION: string;
export declare const NLS_NO_RESULTS: string;
export declare class FindWidgetViewZone implements IViewZone {
    readonly afterLineNumber: number;
    heightInPx: number;
    readonly suppressMouseDown: boolean;
    readonly domNode: HTMLElement;
    constructor(afterLineNumber: number);
}
export declare class FindWidget extends Widget implements IOverlayWidget, IVerticalSashLayoutProvider {
    private readonly _hoverService;
    private readonly _findWidgetSearchHistory;
    private readonly _replaceWidgetHistory;
    private readonly _configurationService;
    private readonly _accessibilityService;
    private static readonly ID;
    private readonly _codeEditor;
    private readonly _state;
    private readonly _controller;
    private readonly _contextViewProvider;
    private readonly _keybindingService;
    private readonly _contextKeyService;
    private _domNode;
    private _cachedHeight;
    private _findInput;
    private _replaceInput;
    private _toggleReplaceBtn;
    private _matchesCount;
    private _prevBtn;
    private _nextBtn;
    private _toggleSelectionFind;
    private _closeBtn;
    private _replaceBtn;
    private _replaceAllBtn;
    private _isVisible;
    private _isReplaceVisible;
    private _ignoreChangeEvent;
    private _accessibilityHelpHintAnnounced;
    private _labelResetTimeout;
    private _lastFocusedInputWasReplace;
    private readonly _findFocusTracker;
    private readonly _findInputFocused;
    private readonly _replaceFocusTracker;
    private readonly _replaceInputFocused;
    private _widgetFocusTracker;
    private readonly _findWidgetFocused;
    private _lastFocusedElement;
    private _viewZone?;
    private _viewZoneId?;
    private _resizeSash;
    private _resized;
    private readonly _updateHistoryDelayer;
    constructor(codeEditor: ICodeEditor, controller: IFindController, state: FindReplaceState, contextViewProvider: IContextViewProvider, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, _hoverService: IHoverService, _findWidgetSearchHistory: IHistory<string> | undefined, _replaceWidgetHistory: IHistory<string> | undefined, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService);
    getId(): string;
    getDomNode(): HTMLElement;
    /**
     * Returns whether the Replace input was the last focused input in the find widget.
     * This persists even after focus leaves the widget, allowing external code to know
     * which input to restore focus to.
     */
    get lastFocusedInputWasReplace(): boolean;
    /**
     * Returns the last focused element within the Find widget.
     * This is useful for restoring focus to the exact element after
     * accessibility help or other overlays are dismissed.
     */
    get lastFocusedElement(): HTMLElement | null;
    /**
     * Focuses the last focused element in the Find widget.
     * Falls back to the Find or Replace input based on lastFocusedInputWasReplace.
     */
    focusLastElement(): void;
    getPosition(): IOverlayWidgetPosition | null;
    private _onStateChanged;
    private _delayedUpdateHistory;
    private _updateHistory;
    private _updateMatchesCount;
    private _getAriaLabel;
    /**
     * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
     * If 'selection find' is OFF we enable the button only if there is a selection.
     */
    private _updateToggleSelectionFindButton;
    private _updateButtons;
    private _revealTimeouts;
    private _reveal;
    private _hide;
    private _layoutViewZone;
    private _showViewZone;
    private _removeViewZone;
    private _tryUpdateWidgetWidth;
    private _getHeight;
    private _tryUpdateHeight;
    focusFindInput(): void;
    focusReplaceInput(): void;
    highlightFindOptions(): void;
    private _updateSearchScope;
    private _onFindInputMouseDown;
    private _onFindInputKeyDown;
    private _onReplaceInputKeyDown;
    getVerticalSashLeft(_sash: Sash): number;
    private _keybindingLabelFor;
    private _buildDomNode;
    private updateAccessibilitySupport;
    private _updateFindInputAriaLabel;
    getViewState(): {
        widgetViewZoneVisible: boolean;
        scrollTop: number;
    };
    setViewState(state?: {
        widgetViewZoneVisible: boolean;
        scrollTop: number;
    }): void;
}
export interface ISimpleButtonOpts {
    readonly label: string;
    readonly className?: string;
    readonly icon?: ThemeIcon;
    readonly hoverLifecycleOptions?: IHoverLifecycleOptions;
    readonly onTrigger: () => void;
    readonly onKeyDown?: (e: IKeyboardEvent) => void;
}
export declare class SimpleButton extends Widget {
    private readonly _opts;
    private readonly _domNode;
    constructor(opts: ISimpleButtonOpts, hoverService: IHoverService);
    get domNode(): HTMLElement;
    isEnabled(): boolean;
    focus(): void;
    setEnabled(enabled: boolean): void;
    setExpanded(expanded: boolean): void;
}
