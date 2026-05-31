import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../../../browser/editorBrowser.js";
import { LineRange } from "../../../../../../common/core/ranges/lineRange.js";
import { ILanguageService } from "../../../../../../common/languages/language.service.js";
import { InlineCompletionEditorType } from "../../../model/provideInlineCompletions.js";
import { GhostTextView } from "../../ghostText/ghostTextView.js";
import { IInlineEditsView, InlineEditClickEvent, InlineEditTabAction } from "../inlineEditsViewInterface.js";
export declare class InlineEditsInsertionView extends Disposable implements IInlineEditsView {
    private readonly _editor;
    private readonly _input;
    private readonly _tabAction;
    private readonly _languageService;
    private readonly _editorObs;
    private readonly _onDidClick;
    readonly onDidClick: import("../../../../../../../base/common/event.js").Event<InlineEditClickEvent>;
    private readonly _state;
    private readonly _trimVertically;
    private readonly _maxPrefixTrim;
    private readonly _ghostText;
    protected readonly _ghostTextView: GhostTextView;
    readonly isHovered: IObservable<boolean>;
    constructor(_editor: ICodeEditor, _input: IObservable<{
        lineNumber: number;
        startColumn: number;
        text: string;
        editorType: InlineCompletionEditorType;
    } | undefined>, _tabAction: IObservable<InlineEditTabAction>, instantiationService: IInstantiationService, _languageService: ILanguageService);
    private readonly _display;
    private readonly _editorMaxContentWidthInRange;
    readonly startLineOffset: IObservable<number>;
    readonly originalLines: IObservable<LineRange | undefined>;
    private readonly _overlayLayout;
    private readonly _modifiedOverlay;
    private readonly _view;
}
