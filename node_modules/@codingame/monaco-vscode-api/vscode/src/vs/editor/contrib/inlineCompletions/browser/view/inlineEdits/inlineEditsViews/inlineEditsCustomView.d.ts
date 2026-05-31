import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.service.js";
import { ICodeEditor } from "../../../../../../browser/editorBrowser.js";
import { ILanguageService } from "../../../../../../common/languages/language.service.js";
import { InlineSuggestHint } from "../../../model/inlineSuggestionItem.js";
import { InlineCompletionEditorType } from "../../../model/provideInlineCompletions.js";
import { IInlineEditsView, InlineEditClickEvent, InlineEditTabAction } from "../inlineEditsViewInterface.js";
export declare class InlineEditsCustomView extends Disposable implements IInlineEditsView {
    private readonly _editor;
    private readonly _languageService;
    private readonly _onDidClick;
    readonly onDidClick: import("../../../../../../../base/common/event.js").Event<InlineEditClickEvent>;
    private readonly _isHovered;
    readonly isHovered: IObservable<boolean>;
    private readonly _viewRef;
    private readonly _editorObs;
    readonly minEditorScrollHeight: IObservable<number>;
    constructor(_editor: ICodeEditor, displayLocation: IObservable<InlineSuggestHint | undefined>, tabAction: IObservable<InlineEditTabAction>, editorType: IObservable<InlineCompletionEditorType>, themeService: IThemeService, _languageService: ILanguageService);
    private fitsInsideViewport;
    private getState;
    private getRendering;
}
