import { Event } from "../../../../../../base/common/event.js";
import { IObservable } from "../../../../../../base/common/observable.js";
import { InlineCompletionsModel } from "../../model/inlineCompletionsModel.js";
import { InlineSuggestHint } from "../../model/inlineSuggestionItem.js";
import { InlineCompletionEditorType } from "../../model/provideInlineCompletions.js";
import { InlineCompletionViewData, InlineCompletionViewKind, InlineEditTabAction } from "./inlineEditsViewInterface.js";
import { InlineEditWithChanges } from "./inlineEditWithChanges.js";
/**
 * Warning: This is not per inline edit id and gets created often.
 * @deprecated TODO@hediet remove
*/
export declare class ModelPerInlineEdit {
    private readonly _model;
    readonly inlineEdit: InlineEditWithChanges;
    readonly tabAction: IObservable<InlineEditTabAction>;
    readonly editorType: InlineCompletionEditorType;
    readonly displayLocation: InlineSuggestHint | undefined;
    /** Determines if the inline suggestion is fully in the view port */
    readonly inViewPort: IObservable<boolean>;
    readonly onDidAccept: Event<void>;
    constructor(_model: InlineCompletionsModel, inlineEdit: InlineEditWithChanges, tabAction: IObservable<InlineEditTabAction>);
    accept(alternativeAction?: boolean): void;
    handleInlineEditShownNextFrame(viewKind: InlineCompletionViewKind, viewData: InlineCompletionViewData): void;
}
