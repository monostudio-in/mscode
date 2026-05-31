import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../../../base/common/observable.js";
import { ICodeEditor } from "../../../../../../browser/editorBrowser.js";
import { AbstractText } from "../../../../../../common/core/text/abstractText.js";
import { DetailedLineRangeMapping } from "../../../../../../common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../../common/model.js";
import { IInlineEditsView, InlineEditClickEvent } from "../inlineEditsViewInterface.js";
import { InlineCompletionEditorType } from "../../../model/provideInlineCompletions.js";
export interface IOriginalEditorInlineDiffViewState {
    diff: DetailedLineRangeMapping[];
    modifiedText: AbstractText;
    mode: "insertionInline" | "sideBySide" | "deletion" | "lineReplacement";
    editorType: InlineCompletionEditorType;
    modifiedCodeEditor: ICodeEditor;
}
export declare class OriginalEditorInlineDiffView extends Disposable implements IInlineEditsView {
    private readonly _originalEditor;
    private readonly _state;
    private readonly _modifiedTextModel;
    static supportsInlineDiffRendering(mapping: DetailedLineRangeMapping): boolean;
    private readonly _onDidClick;
    readonly onDidClick: import("../../../../../../../base/common/event.js").Event<InlineEditClickEvent>;
    readonly isHovered: IObservable<boolean>;
    private readonly _tokenizationFinished;
    constructor(_originalEditor: ICodeEditor, _state: IObservable<IOriginalEditorInlineDiffViewState | undefined>, _modifiedTextModel: ITextModel);
    private readonly _decorations;
}
