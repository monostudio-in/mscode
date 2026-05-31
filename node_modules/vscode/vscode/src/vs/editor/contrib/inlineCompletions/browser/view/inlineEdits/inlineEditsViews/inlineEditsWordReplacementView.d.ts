import { IEquatable } from "../../../../../../../base/common/equals.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { IHoverService } from "../../../../../../../platform/hover/browser/hover.service.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.service.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.service.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { TextReplacement } from "../../../../../../common/core/edits/textEdit.js";
import { ILanguageService } from "../../../../../../common/languages/language.service.js";
import { InlineSuggestAlternativeAction } from "../../../model/InlineSuggestAlternativeAction.js";
import { InlineCompletionEditorType } from "../../../model/provideInlineCompletions.js";
import { IInlineEditsView, InlineEditClickEvent, InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { IUserInteractionService } from "../../../../../../../platform/userInteraction/browser/userInteractionService.service.js";
export declare class WordReplacementsViewData implements IEquatable<WordReplacementsViewData> {
    readonly edit: TextReplacement;
    readonly editorType: InlineCompletionEditorType;
    readonly alternativeAction: InlineSuggestAlternativeAction | undefined;
    constructor(edit: TextReplacement, editorType: InlineCompletionEditorType, alternativeAction: InlineSuggestAlternativeAction | undefined);
    equals(other: WordReplacementsViewData): boolean;
}
export declare class InlineEditsWordReplacementView extends Disposable implements IInlineEditsView {
    private readonly _editor;
    private readonly _viewData;
    protected readonly _tabAction: IObservable<InlineEditTabAction>;
    private readonly _languageService;
    private readonly _themeService;
    private readonly _keybindingService;
    private readonly _hoverService;
    private readonly _userInteractionService;
    static MAX_LENGTH: number;
    private readonly _onDidClick;
    readonly onDidClick: import("../../../../../../../base/common/event.js").Event<InlineEditClickEvent>;
    private readonly _start;
    private readonly _end;
    private readonly _line;
    private readonly _primaryElement;
    private readonly _secondaryElement;
    readonly isHovered: import("../../../../../../../base/common/observable.js").IObservableWithChange<boolean, void>;
    readonly minEditorScrollHeight: import("../../../../../../../base/common/observable.js").IObservableWithChange<number, void>;
    constructor(_editor: ObservableCodeEditor, _viewData: WordReplacementsViewData, _tabAction: IObservable<InlineEditTabAction>, _languageService: ILanguageService, _themeService: IThemeService, _keybindingService: IKeybindingService, _hoverService: IHoverService, _userInteractionService: IUserInteractionService);
    private readonly _renderTextEffect;
    private readonly _layout;
    private readonly _root;
    private _mouseDown;
}
