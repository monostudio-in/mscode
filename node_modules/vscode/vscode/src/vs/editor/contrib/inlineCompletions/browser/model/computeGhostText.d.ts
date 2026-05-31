import { IDiffChange } from "../../../../../base/common/diff/diff.js";
import { Position } from "../../../../common/core/position.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { ITextModel } from "../../../../common/model.js";
import { GhostText } from "./ghostText.js";
/**
 * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
 * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
*/
export declare function computeGhostText(edit: TextReplacement, model: ITextModel, mode: "prefix" | "subword" | "subwordSmart", cursorPosition?: Position, previewSuffixLength?: number): GhostText | undefined;
/**
 * When matching `if ()` with `if (f() = 1) { g(); }`,
 * align it like this:        `if (       )`
 * Not like this:			  `if (  )`
 * Also not like this:		  `if (             )`.
 *
 * The parenthesis are preprocessed to ensure that they match correctly.
 */
export declare function smartDiff(originalValue: string, newValue: string, smartBracketMatching: boolean): (readonly IDiffChange[]) | undefined;
