import { Position } from "./core/position.js";
import { Range } from "./core/range.js";
import { ITextModel, PositionAffinity } from "./model.js";
export interface ICoordinatesConverter {
    convertViewPositionToModelPosition(viewPosition: Position): Position;
    convertViewRangeToModelRange(viewRange: Range): Range;
    validateViewPosition(viewPosition: Position, expectedModelPosition: Position): Position;
    validateViewRange(viewRange: Range, expectedModelRange: Range): Range;
    /**
     * @param allowZeroLineNumber Should it return 0 when there are hidden lines at the top and the position is in the hidden area?
     * @param belowHiddenRanges When the model position is in a hidden area, should it return the first view position after or before?
     */
    convertModelPositionToViewPosition(modelPosition: Position, affinity?: PositionAffinity, allowZeroLineNumber?: boolean, belowHiddenRanges?: boolean): Position;
    /**
     * @param affinity Only has an effect if the range is empty.
    */
    convertModelRangeToViewRange(modelRange: Range, affinity?: PositionAffinity): Range;
    modelPositionIsVisible(modelPosition: Position): boolean;
    getModelLineViewLineCount(modelLineNumber: number): number;
    getViewLineNumberOfModelPosition(modelLineNumber: number, modelColumn: number): number;
}
export declare class IdentityCoordinatesConverter implements ICoordinatesConverter {
    private readonly _model;
    constructor(model: ITextModel);
    private _validPosition;
    private _validRange;
    convertViewPositionToModelPosition(viewPosition: Position): Position;
    convertViewRangeToModelRange(viewRange: Range): Range;
    validateViewPosition(_viewPosition: Position, expectedModelPosition: Position): Position;
    validateViewRange(_viewRange: Range, expectedModelRange: Range): Range;
    convertModelPositionToViewPosition(modelPosition: Position): Position;
    convertModelRangeToViewRange(modelRange: Range): Range;
    modelPositionIsVisible(modelPosition: Position): boolean;
    modelRangeIsVisible(modelRange: Range): boolean;
    getModelLineViewLineCount(modelLineNumber: number): number;
    getViewLineNumberOfModelPosition(modelLineNumber: number, modelColumn: number): number;
}
