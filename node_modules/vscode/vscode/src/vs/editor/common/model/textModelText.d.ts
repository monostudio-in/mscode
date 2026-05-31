import { Range } from "../core/range.js";
import { AbstractText } from "../core/text/abstractText.js";
import { TextLength } from "../core/text/textLength.js";
import { ITextModel } from "../model.js";
export declare class TextModelText extends AbstractText {
    private readonly _textModel;
    constructor(_textModel: ITextModel);
    getValueOfRange(range: Range): string;
    getLineLength(lineNumber: number): number;
    get length(): TextLength;
}
