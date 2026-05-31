import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable, ISettableObservable } from "../../../../../../../base/common/observable.js";
import { IAccessibilityService } from "../../../../../../../platform/accessibility/common/accessibility.service.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.service.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { HoverService } from "../../../../../../../platform/hover/browser/hoverService.js";
import { LineRange } from "../../../../../../common/core/ranges/lineRange.js";
import { InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { Command, InlineCompletionCommand, IInlineCompletionModelInfo } from "../../../../../../common/languages.js";
import { InlineSuggestionItem } from "../../../model/inlineSuggestionItem.js";
import { InlineCompletionsModel } from "../../../model/inlineCompletionsModel.js";
import { InlineSuggestAlternativeAction } from "../../../model/InlineSuggestAlternativeAction.js";
import { ThemeIcon } from "../../../../../../../base/common/themables.js";
import { IUserInteractionService } from "../../../../../../../platform/userInteraction/browser/userInteractionService.service.js";
import { Event } from "../../../../../../../base/common/event.js";
/**
 * Customization options for the gutter indicator appearance and behavior.
 */
export interface GutterIndicatorCustomization {
    /** Override the default icon */
    readonly icon?: ThemeIcon;
}
export declare class InlineEditsGutterIndicatorData {
    readonly gutterMenuData: InlineSuggestionGutterMenuData;
    readonly originalRange: LineRange;
    readonly model: SimpleInlineSuggestModel;
    readonly altAction: InlineSuggestAlternativeAction | undefined;
    readonly customization?: GutterIndicatorCustomization | undefined;
    constructor(gutterMenuData: InlineSuggestionGutterMenuData, originalRange: LineRange, model: SimpleInlineSuggestModel, altAction: InlineSuggestAlternativeAction | undefined, customization?: GutterIndicatorCustomization | undefined);
}
export declare class InlineSuggestionGutterMenuData {
    readonly action: Command | undefined;
    readonly displayName: string;
    readonly extensionCommands: InlineCompletionCommand[][];
    readonly alternativeAction: InlineSuggestAlternativeAction | undefined;
    readonly modelInfo: IInlineCompletionModelInfo | undefined;
    readonly setModelId: ((modelId: string) => Promise<void>) | undefined;
    readonly extensionCommandsOnly: boolean;
    static fromInlineSuggestion(suggestion: InlineSuggestionItem): InlineSuggestionGutterMenuData;
    constructor(action: Command | undefined, displayName: string, extensionCommands: InlineCompletionCommand[][], alternativeAction: InlineSuggestAlternativeAction | undefined, modelInfo: IInlineCompletionModelInfo | undefined, setModelId: ((modelId: string) => Promise<void>) | undefined, extensionCommandsOnly?: boolean);
}
export declare class SimpleInlineSuggestModel {
    readonly accept: () => void;
    readonly jump: () => void;
    static fromInlineCompletionModel(model: InlineCompletionsModel): SimpleInlineSuggestModel;
    constructor(accept: () => void, jump: () => void);
}
export declare class InlineEditsGutterIndicator extends Disposable {
    private readonly _editorObs;
    private readonly _data;
    private readonly _tabAction;
    private readonly _verticalOffset;
    private readonly _isHoveringOverInlineEdit;
    private readonly _focusIsInMenu;
    protected readonly _hoverService: HoverService;
    private readonly _instantiationService;
    private readonly _accessibilityService;
    private readonly _themeService;
    private readonly _userInteractionService;
    private readonly _onDidCloseWithCommand;
    readonly onDidCloseWithCommand: Event<string>;
    constructor(_editorObs: ObservableCodeEditor, _data: IObservable<InlineEditsGutterIndicatorData | undefined>, _tabAction: IObservable<InlineEditTabAction>, _verticalOffset: IObservable<number>, _isHoveringOverInlineEdit: IObservable<boolean>, _focusIsInMenu: ISettableObservable<boolean>, _hoverService: HoverService, _instantiationService: IInstantiationService, _accessibilityService: IAccessibilityService, _themeService: IThemeService, _userInteractionService: IUserInteractionService);
    private readonly _isHoveredOverInlineEditDebounced;
    private readonly _modifierPressed;
    private readonly _gutterIndicatorStyles;
    triggerAnimation(): Promise<Animation>;
    private readonly _originalRangeObs;
    private readonly _state;
    private readonly _stickyScrollController;
    private readonly _stickyScrollHeight;
    private readonly _lineNumberToRender;
    private readonly _availableWidthForIcon;
    private readonly _layout;
    protected readonly _iconRef: import("../../../../../../../base/browser/dom.js").IRefWithVal<HTMLDivElement>;
    readonly isVisible: IObservable<boolean>;
    protected readonly _hoverVisible: ISettableObservable<boolean, void>;
    readonly isHoverVisible: IObservable<boolean>;
    private readonly _isHoveredOverIcon;
    private readonly _isHoveredOverIconDebounced;
    readonly isHoveredOverIcon: IObservable<boolean>;
    protected _showHover(): void;
    private readonly _indicator;
}
