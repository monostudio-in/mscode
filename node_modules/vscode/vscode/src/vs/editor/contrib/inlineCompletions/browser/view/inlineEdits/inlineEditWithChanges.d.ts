import { LineReplacement } from "../../../../../common/core/edits/lineEdit.js";
import { TextEdit } from "../../../../../common/core/edits/textEdit.js";
import { Position } from "../../../../../common/core/position.js";
import { LineRange } from "../../../../../common/core/ranges/lineRange.js";
import { InlineCompletionCommand } from "../../../../../common/languages.js";
import { InlineSuggestionAction, InlineSuggestionItem } from "../../model/inlineSuggestionItem.js";
import { TextModelValueReference } from "../../model/textModelValueReference.js";
export declare class InlineEditWithChanges {
    readonly originalText: TextModelValueReference;
    readonly action: InlineSuggestionAction | undefined;
    readonly edit: TextEdit | undefined;
    readonly cursorPosition: Position;
    readonly multiCursorPositions: readonly Position[];
    readonly commands: readonly InlineCompletionCommand[];
    readonly inlineCompletion: InlineSuggestionItem;
    get lineEdit(): LineReplacement;
    get originalLineRange(): LineRange;
    get modifiedLineRange(): LineRange;
    get displayRange(): LineRange;
    constructor(originalText: TextModelValueReference, action: InlineSuggestionAction | undefined, edit: TextEdit | undefined, cursorPosition: Position, multiCursorPositions: readonly Position[], commands: readonly InlineCompletionCommand[], inlineCompletion: InlineSuggestionItem);
}
