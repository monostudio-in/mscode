import { EditorAutoClosingEditStrategy, EditorAutoClosingStrategy } from "../config/editorOptions.js";
import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from "../cursorCommon.js";
import { Range } from "../core/range.js";
import { Selection } from "../core/selection.js";
import { ICommand } from "../editorCommon.js";
import { StandardAutoClosingPairConditional } from "../languages/languageConfiguration.js";
export declare class DeleteOperations {
    static deleteRight(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): [
        boolean,
        Array<ICommand | null>
    ];
    private static getDeleteRightRange;
    static isAutoClosingPairDelete(autoClosingDelete: EditorAutoClosingEditStrategy, autoClosingBrackets: EditorAutoClosingStrategy, autoClosingQuotes: EditorAutoClosingStrategy, autoClosingPairsOpen: Map<string, StandardAutoClosingPairConditional[]>, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): boolean;
    private static _runAutoClosingPairDelete;
    static deleteLeft(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): [
        boolean,
        Array<ICommand | null>
    ];
    private static getDeleteLeftRange;
    private static getPositionAfterDeleteLeft;
    static cut(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): EditOperationResult;
}
