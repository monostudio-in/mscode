import * as dom from "../../../../../base/browser/dom.js";
import { Widget } from "../../../../../base/browser/ui/widget.js";
import { FindReplaceState, INewFindReplaceState } from "../../../../../editor/contrib/find/browser/findState.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.service.js";
import { IContextViewService } from "../../../../../platform/contextview/browser/contextView.service.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.service.js";
import { IVerticalSashLayoutProvider, Sash } from "../../../../../base/browser/ui/sash/sash.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.service.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.service.js";
interface IFindOptions {
    showCommonFindToggles?: boolean;
    checkImeCompletionState?: boolean;
    showResultCount?: boolean;
    appendCaseSensitiveActionId?: string;
    appendRegexActionId?: string;
    appendWholeWordsActionId?: string;
    previousMatchActionId?: string;
    nextMatchActionId?: string;
    closeWidgetActionId?: string;
    matchesLimit?: number;
    type?: "Terminal" | "Webview";
    initialWidth?: number;
    enableSash?: boolean;
}
export declare abstract class SimpleFindWidget extends Widget implements IVerticalSashLayoutProvider {
    private readonly _keybindingService;
    private readonly _configurationService;
    private readonly _accessibilityService;
    private readonly _findInput;
    private readonly _domNode;
    private readonly _innerDomNode;
    private readonly _focusTracker;
    private readonly _findInputFocusTracker;
    private readonly _updateHistoryDelayer;
    private readonly prevBtn;
    private readonly nextBtn;
    private readonly _matchesLimit;
    private _matchesCount;
    private _isVisible;
    private _foundMatch;
    private _width;
    /**
     * Tracks whether the accessibility help hint has been announced in the ARIA label.
     * Reset to false when the widget is hidden, allowing the hint to be announced again
     * on the next reveal.
     */
    private _accessibilityHelpHintAnnounced;
    private _labelResetTimeout;
    readonly state: FindReplaceState;
    constructor(options: IFindOptions, contextViewService: IContextViewService, contextKeyService: IContextKeyService, hoverService: IHoverService, _keybindingService: IKeybindingService, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService);
    getVerticalSashLeft(_sash: Sash): number;
    abstract find(previous: boolean): void;
    abstract findFirst(): void;
    protected abstract _onInputChanged(): boolean;
    protected abstract _onFocusTrackerFocus(): void;
    protected abstract _onFocusTrackerBlur(): void;
    protected abstract _onFindInputFocusTrackerFocus(): void;
    protected abstract _onFindInputFocusTrackerBlur(): void;
    protected abstract _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected get inputValue(): string;
    get focusTracker(): dom.IFocusTracker;
    private _getKeybinding;
    dispose(): void;
    isVisible(): boolean;
    getDomNode(): HTMLElement;
    getFindInputDomNode(): HTMLElement;
    reveal(initialInput?: string, animated?: boolean): void;
    show(initialInput?: string): void;
    hide(animated?: boolean): void;
    layout(width?: number): void;
    protected _delayedUpdateHistory(): void;
    protected _updateHistory(): void;
    protected _getRegexValue(): boolean;
    protected _getWholeWordValue(): boolean;
    protected _getCaseSensitiveValue(): boolean;
    protected updateButtons(foundMatch: boolean): void;
    protected focusFindBox(): void;
    updateResultCount(): Promise<void>;
    changeState(state: INewFindReplaceState): void;
    /**
     * Updates the ARIA label of the find input box.
     * When a screen reader is active and the accessibility verbosity setting is enabled,
     * includes a hint about pressing Alt+F1 for accessibility help on first reveal.
     * The hint is only announced once per show/hide cycle to prevent double-speak.
     */
    private _updateFindInputAriaLabel;
    private _announceSearchResults;
}
export declare const simpleFindWidgetSashBorder: string;
export {};
