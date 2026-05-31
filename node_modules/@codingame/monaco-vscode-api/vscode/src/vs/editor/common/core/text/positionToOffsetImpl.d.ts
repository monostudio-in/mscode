import { StringEdit, StringReplacement } from "../edits/stringEdit.js";
import { OffsetRange } from "../ranges/offsetRange.js";
import { Position } from "../position.js";
import { Range } from "../range.js";
import type { TextReplacement, TextEdit } from "../edits/textEdit.js";
import type { TextLength } from "./textLength.js";
export declare abstract class PositionOffsetTransformerBase {
    abstract getOffset(position: Position): number;
    getOffsetRange(range: Range): OffsetRange;
    abstract getPosition(offset: number): Position;
    getRange(offsetRange: OffsetRange): Range;
    getStringEdit(edit: TextEdit): StringEdit;
    getStringReplacement(edit: TextReplacement): StringReplacement;
    getTextReplacement(edit: StringReplacement): TextReplacement;
    getTextEdit(edit: StringEdit): TextEdit;
}
interface IDeps {
    StringEdit: typeof StringEdit;
    StringReplacement: typeof StringReplacement;
    TextReplacement: typeof TextReplacement;
    TextEdit: typeof TextEdit;
    TextLength: typeof TextLength;
}
/** This is to break circular module dependencies. */
export declare function _setPositionOffsetTransformerDependencies(deps: IDeps): void;
export declare class PositionOffsetTransformer extends PositionOffsetTransformerBase {
    readonly text: string;
    private _lineStartOffsetByLineIdx;
    private _lineEndOffsetByLineIdx;
    constructor(text: string);
    private get lineStartOffsetByLineIdx();
    private get lineEndOffsetByLineIdx();
    private _computeLineOffsets;
    getOffset(position: Position): number;
    private _validatePosition;
    getPosition(offset: number): Position;
    getTextLength(offsetRange: OffsetRange): TextLength;
    get textLength(): TextLength;
    getLineLength(lineNumber: number): number;
}
export {};
