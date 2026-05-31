import { Position } from "../position.js";
import { Range } from "../range.js";
import { LineRange } from "../ranges/lineRange.js";
import { OffsetRange } from "../ranges/offsetRange.js";
import { TextLength } from "./textLength.js";
import { PositionOffsetTransformer } from "./positionToOffsetImpl.js";
export declare abstract class AbstractText {
    abstract getValueOfRange(range: Range): string;
    abstract readonly length: TextLength;
    get endPositionExclusive(): Position;
    get lineRange(): LineRange;
    getValue(): string;
    getValueOfOffsetRange(range: OffsetRange): string;
    getLineLength(lineNumber: number): number;
    private _transformer;
    getTransformer(): PositionOffsetTransformer;
    getLineAt(lineNumber: number): string;
    getLines(): string[];
    getLinesOfRange(range: LineRange): string[];
    equals(other: AbstractText): boolean;
}
export declare class LineBasedText extends AbstractText {
    private readonly _getLineContent;
    private readonly _lineCount;
    constructor(_getLineContent: (lineNumber: number) => string, _lineCount: number);
    getValueOfRange(range: Range): string;
    getLineLength(lineNumber: number): number;
    get length(): TextLength;
}
export declare class ArrayText extends LineBasedText {
    constructor(lines: string[]);
}
export declare class StringText extends AbstractText {
    readonly value: string;
    private readonly _t;
    constructor(value: string);
    getValueOfRange(range: Range): string;
    get length(): TextLength;
    getTransformer(): PositionOffsetTransformer;
}
