import { Range } from "../../../../common/core/range.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { ITextModel } from "../../../../common/model.js";
export declare function singleTextRemoveCommonPrefix(edit: TextReplacement, model: ITextModel, validModelRange?: Range): TextReplacement;
export declare function singleTextEditAugments(edit: TextReplacement, base: TextReplacement): boolean;
