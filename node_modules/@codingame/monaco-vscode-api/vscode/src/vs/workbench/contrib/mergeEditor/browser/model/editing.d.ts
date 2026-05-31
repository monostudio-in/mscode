import { Range } from "../../../../../editor/common/core/range.js";
import { IIdentifiedSingleEditOperation } from "../../../../../editor/common/model.js";
import { MergeEditorLineRange } from "./lineRange.js";
/**
 * Represents an edit, expressed in whole lines:
 * At (before) {@link MergeEditorLineRange.startLineNumber}, delete {@link MergeEditorLineRange.length} many lines and insert {@link newLines}.
*/
export declare class LineRangeEdit {
    readonly range: MergeEditorLineRange;
    readonly newLines: string[];
    constructor(range: MergeEditorLineRange, newLines: string[]);
    equals(other: LineRangeEdit): boolean;
    toEdits(modelLineCount: number): IIdentifiedSingleEditOperation[];
}
export declare class RangeEdit {
    readonly range: Range;
    readonly newText: string;
    constructor(range: Range, newText: string);
    equals(other: RangeEdit): boolean;
}
export declare class LineEdits {
    readonly edits: readonly LineRangeEdit[];
    constructor(edits: readonly LineRangeEdit[]);
    toEdits(modelLineCount: number): IIdentifiedSingleEditOperation[];
}
