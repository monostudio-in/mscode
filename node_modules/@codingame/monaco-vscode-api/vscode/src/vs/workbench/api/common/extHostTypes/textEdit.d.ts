import { Position } from "./position.js";
import { Range } from "./range.js";
export declare enum EndOfLine {
    LF = 1,
    CRLF = 2
}
export declare class TextEdit {
    static isTextEdit(thing: unknown): thing is TextEdit;
    static replace(range: Range, newText: string): TextEdit;
    static insert(position: Position, newText: string): TextEdit;
    static delete(range: Range): TextEdit;
    static setEndOfLine(eol: EndOfLine): TextEdit;
    protected _range: Range;
    protected _newText: string | null;
    protected _newEol?: EndOfLine;
    get range(): Range;
    set range(value: Range);
    get newText(): string;
    set newText(value: string);
    get newEol(): EndOfLine | undefined;
    set newEol(value: EndOfLine | undefined);
    constructor(range: Range, newText: string | null);
    toJSON(): {
        range: Range;
        newText: string;
        newEol: EndOfLine | undefined;
    };
}
