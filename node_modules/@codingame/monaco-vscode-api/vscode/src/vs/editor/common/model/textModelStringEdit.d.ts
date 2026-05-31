import { StringEdit } from "../core/edits/stringEdit.js";
import { DetailedLineRangeMapping } from "../diff/rangeMapping.js";
import { ITextModel, IIdentifiedSingleEditOperation } from "../model.js";
import { IModelContentChange } from "./mirrorTextModel.js";
import { LengthEdit } from "../core/edits/lengthEdit.js";
export declare function offsetEditToEditOperations(offsetEdit: StringEdit, doc: ITextModel): IIdentifiedSingleEditOperation[];
export declare function offsetEditFromContentChanges(contentChanges: readonly IModelContentChange[]): StringEdit;
export declare function offsetEditFromLineRangeMapping(original: ITextModel, modified: ITextModel, changes: readonly DetailedLineRangeMapping[]): StringEdit;
export declare function linesLengthEditFromModelContentChange(c: IModelContentChange[]): LengthEdit;
