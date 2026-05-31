import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { EndOfLinePreference } from "../model.js";
export interface ISimpleModel {
    getLineContent(lineNumber: number): string;
    getLineCount(): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
}
