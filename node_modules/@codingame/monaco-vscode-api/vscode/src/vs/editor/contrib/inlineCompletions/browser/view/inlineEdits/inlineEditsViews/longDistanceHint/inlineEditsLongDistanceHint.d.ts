import { Event } from "../../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { IObservable, IReader } from "../../../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../../../../browser/editorBrowser.js";
import { Position } from "../../../../../../../common/core/position.js";
import { ITextModel } from "../../../../../../../common/model.js";
import { IInlineEditsView, InlineEditTabAction } from "../../inlineEditsViewInterface.js";
import { InlineEditWithChanges } from "../../inlineEditWithChanges.js";
import { DetailedLineRangeMapping } from "../../../../../../../common/diff/rangeMapping.js";
import { OffsetRange } from "../../../../../../../common/core/ranges/offsetRange.js";
import { IThemeService } from "../../../../../../../../platform/theme/common/themeService.service.js";
import { IKeybindingService } from "../../../../../../../../platform/keybinding/common/keybinding.service.js";
import { InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "../../components/gutterIndicatorView.js";
import { InlineCompletionEditorType } from "../../../../model/provideInlineCompletions.js";
import { IModelService } from "../../../../../../../common/services/model.service.js";
import { ILanguageService } from "../../../../../../../common/languages/language.service.js";
import { TextModelValueReference } from "../../../../model/textModelValueReference.js";
export declare class InlineEditsLongDistanceHint extends Disposable implements IInlineEditsView {
    private readonly _editor;
    private readonly _viewState;
    private readonly _previewTextModel;
    private readonly _tabAction;
    private readonly _instantiationService;
    private readonly _themeService;
    private readonly _keybindingService;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _editorObs;
    readonly onDidClick: Event<any>;
    private _viewWithElement;
    private readonly _previewEditor;
    constructor(_editor: ICodeEditor, _viewState: IObservable<ILongDistanceViewState | undefined>, _previewTextModel: ITextModel, _tabAction: IObservable<InlineEditTabAction>, _instantiationService: IInstantiationService, _themeService: IThemeService, _keybindingService: IKeybindingService, _modelService: IModelService, _languageService: ILanguageService);
    private readonly _styles;
    get isHovered(): IObservable<boolean>;
    private readonly _hintTextPosition;
    private readonly _lineSizesAroundHintPosition;
    private readonly _isVisibleDelayed;
    private readonly _previewEditorLayoutInfo;
    private readonly _view;
    private readonly _widgetContent;
    private readonly _originalTargetLineNumber;
    private readonly _originalOutlineSource;
}
export interface ILongDistanceHint {
    lineNumber: number;
    isVisible: boolean;
}
export interface ILongDistanceViewState {
    hint: ILongDistanceHint;
    newTextLineCount: number;
    edit: InlineEditWithChanges;
    diff: DetailedLineRangeMapping[];
    nextCursorPosition: Position | null;
    editorType: InlineCompletionEditorType;
    target: TextModelValueReference;
    model: SimpleInlineSuggestModel;
    inlineSuggestInfo: InlineSuggestionGutterMenuData;
}
export declare function drawEditorWidths(e: ICodeEditor, reader: IReader): void;
/**
 * Changes the scroll position as little as possible just to reveal the given range in the window.
*/
export declare function scrollToReveal(currentScrollPosition: number, windowWidth: number, contentRangeToReveal: OffsetRange): {
    newScrollPosition: number;
};
