import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.service.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { Range } from "../../../../../../common/core/range.js";
import { LineRange } from "../../../../../../common/core/ranges/lineRange.js";
import { ILanguageService } from "../../../../../../common/languages/language.service.js";
import { InlineCompletionEditorType } from "../../../model/provideInlineCompletions.js";
import { IInlineEditsView, InlineEditClickEvent, InlineEditTabAction } from "../inlineEditsViewInterface.js";
export declare class InlineEditsLineReplacementView extends Disposable implements IInlineEditsView {
    private readonly _editor;
    private readonly _edit;
    private readonly _editorType;
    private readonly _tabAction;
    private readonly _languageService;
    private readonly _themeService;
    private readonly _onDidClick;
    readonly onDidClick: import("../../../../../../../base/common/event.js").Event<InlineEditClickEvent>;
    private readonly _maxPrefixTrim;
    private readonly _modifiedLineElements;
    private readonly _layout;
    private readonly _viewZoneInfo;
    private readonly _div;
    readonly isHovered: IObservable<boolean>;
    readonly minEditorScrollHeight: import("../../../../../../../base/common/observable.js").IObservableWithChange<number, void>;
    constructor(_editor: ObservableCodeEditor, _edit: IObservable<{
        originalRange: LineRange;
        modifiedRange: LineRange;
        modifiedLines: string[];
        replacements: Replacement[];
    } | undefined>, _editorType: IObservable<InlineCompletionEditorType>, _tabAction: IObservable<InlineEditTabAction>, _languageService: ILanguageService, _themeService: IThemeService);
    private _isMouseOverWidget;
    private _previousViewZoneInfo;
    private removePreviousViewZone;
    private addViewZone;
}
export interface Replacement {
    originalRange: Range;
    modifiedRange: Range;
}
