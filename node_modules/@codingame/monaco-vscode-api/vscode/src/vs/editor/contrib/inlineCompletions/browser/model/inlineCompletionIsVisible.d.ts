import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { ITextModel } from "../../../../common/model.js";
export declare function inlineCompletionIsVisible(singleTextEdit: TextReplacement, originalRange: Range | undefined, model: ITextModel, cursorPosition: Position): boolean;
