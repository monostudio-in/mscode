import { Range } from "../../../../../editor/common/core/range.js";
import { LineRange } from "../../../../../editor/common/core/ranges/lineRange.js";
import { ITextModel } from "../../../../../editor/common/model.js";
/**
 * TODO: Deprecate in favor of LineRange!
 */
export declare class MergeEditorLineRange extends LineRange {
    static fromLineNumbers(startLineNumber: number, endExclusiveLineNumber: number): MergeEditorLineRange;
    static fromLength(startLineNumber: number, length: number): MergeEditorLineRange;
    join(other: MergeEditorLineRange): MergeEditorLineRange;
    isAfter(range: MergeEditorLineRange): boolean;
    isBefore(range: MergeEditorLineRange): boolean;
    delta(lineDelta: number): MergeEditorLineRange;
    deltaEnd(delta: number): MergeEditorLineRange;
    deltaStart(lineDelta: number): MergeEditorLineRange;
    getLines(model: ITextModel): string[];
    toInclusiveRangeOrEmpty(): Range;
}
