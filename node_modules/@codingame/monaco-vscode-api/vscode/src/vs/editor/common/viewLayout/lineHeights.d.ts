import { IEditorConfiguration } from "../config/editorConfiguration.js";
import { ICoordinatesConverter } from "../coordinatesConverter.js";
import { IModelDecoration } from "../model.js";
export declare class CustomLine {
    index: number;
    lineNumber: number;
    specialHeight: number;
    prefixSum: number;
    maximumSpecialHeight: number;
    decorationId: string;
    deleted: boolean;
    constructor(decorationId: string, index: number, lineNumber: number, specialHeight: number, prefixSum: number);
}
/**
 * Manages line heights in the editor with support for custom line heights from decorations.
 *
 * This class maintains an ordered collection of line heights, where each line can have either
 * the default height or a custom height specified by decorations. It supports efficient querying
 * of individual line heights as well as accumulated heights up to a specific line.
 *
 * Line heights are stored in a sorted array for efficient binary search operations. Each line
 * with custom height is represented by a {@link CustomLine} object which tracks its special height,
 * accumulated height prefix sum, and associated decoration ID.
 *
 * The class optimizes performance by:
 * - Using binary search to locate lines in the ordered array
 * - Batching updates through a pending changes mechanism
 * - Computing prefix sums for O(1) accumulated height lookup
 * - Tracking maximum height for lines with multiple decorations
 * - Efficiently handling document changes (line insertions and deletions)
 *
 * When lines are inserted or deleted, the manager updates line numbers and prefix sums
 * for all affected lines. It also handles special cases like decorations that span
 * the insertion/deletion points by re-applying those decorations appropriately.
 *
 * All query operations automatically commit pending changes to ensure consistent results.
 * Clients can modify line heights by adding or removing custom line height decorations,
 * which are tracked by their unique decoration IDs.
 */
export declare class LineHeightsManager {
    private _decorationIDToCustomLine;
    private _orderedCustomLines;
    private _pendingChanges;
    private _invalidIndex;
    private _defaultLineHeight;
    private _hasPending;
    constructor(defaultLineHeight: number, customLineHeightData: CustomLineHeightData[]);
    set defaultLineHeight(defaultLineHeight: number);
    get defaultLineHeight(): number;
    removeCustomLineHeight(decorationID: string): void;
    insertOrChangeCustomLineHeight(decorationId: string, startLineNumber: number, endLineNumber: number, lineHeight: number): void;
    heightForLineNumber(lineNumber: number): number;
    getAccumulatedLineHeightsIncludingLineNumber(lineNumber: number): number;
    onLinesDeleted(fromLineNumber: number, toLineNumber: number): void;
    onLinesInserted(fromLineNumber: number, toLineNumber: number): void;
    private _commit;
    private _doRemoveCustomLineHeight;
    private _doInsertOrChangeCustomLineHeight;
    private _flushStagedDecorationChanges;
    private _doLinesDeleted;
    private _doLinesInserted;
    private _binarySearchOverOrderedCustomLinesArray;
}
export declare class CustomLineHeightData {
    readonly decorationId: string;
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly lineHeight: number;
    constructor(decorationId: string, startLineNumber: number, endLineNumber: number, lineHeight: number);
    static fromDecorations(decorations: IModelDecoration[], coordinatesConverter: ICoordinatesConverter, configuration: IEditorConfiguration): CustomLineHeightData[];
}
