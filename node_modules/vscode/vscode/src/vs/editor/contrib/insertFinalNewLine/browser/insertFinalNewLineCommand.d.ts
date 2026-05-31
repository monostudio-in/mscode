import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Selection } from "../../../common/core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import { ITextModel } from "../../../common/model.js";
export declare class InsertFinalNewLineCommand implements ICommand {
    private readonly _selection;
    private _selectionId;
    constructor(selection: Selection);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
/**
 * Generate edit operations for inserting a final new line if needed.
 * Returns undefined if no edit is needed.
 */
export declare function insertFinalNewLine(model: ITextModel): ISingleEditOperation | undefined;
