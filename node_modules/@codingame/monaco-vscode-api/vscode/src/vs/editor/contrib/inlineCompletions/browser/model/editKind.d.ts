import { Position } from "../../../../common/core/position.js";
import { StringEdit } from "../../../../common/core/edits/stringEdit.js";
import { ITextModel } from "../../../../common/model.js";
type SingleCharacterKind = "syntactical" | "identifier" | "whitespace";
interface SingleLineTextShape {
    readonly kind: "singleLine";
    readonly isSingleCharacter: boolean;
    readonly singleCharacterKind: SingleCharacterKind | undefined;
    readonly isWord: boolean;
    readonly isMultipleWords: boolean;
    readonly isMultipleWhitespace: boolean;
    readonly hasDuplicatedWhitespace: boolean;
}
interface MultiLineTextShape {
    readonly kind: "multiLine";
    readonly lineCount: number;
}
type TextShape = SingleLineTextShape | MultiLineTextShape;
type InsertLocationShape = "endOfLine" | "emptyLine" | "startOfLine" | "middleOfLine";
interface InsertLocationRelativeToCursor {
    readonly atCursor: boolean;
    readonly beforeCursorOnSameLine: boolean;
    readonly afterCursorOnSameLine: boolean;
    readonly linesAbove: number | undefined;
    readonly linesBelow: number | undefined;
}
export interface InsertProperties {
    readonly textShape: TextShape;
    readonly locationShape: InsertLocationShape;
    readonly relativeToCursor: InsertLocationRelativeToCursor | undefined;
}
export interface DeleteProperties {
    readonly textShape: TextShape;
    readonly isAtEndOfLine: boolean;
    readonly deletesEntireLineContent: boolean;
}
export interface ReplaceProperties {
    readonly isWordToWordReplacement: boolean;
    readonly isAdditive: boolean;
    readonly isSubtractive: boolean;
    readonly isSingleLineToSingleLine: boolean;
    readonly isSingleLineToMultiLine: boolean;
    readonly isMultiLineToSingleLine: boolean;
}
type EditOperation = "insert" | "delete" | "replace";
interface IInlineSuggestionEditKindEdit {
    readonly operation: EditOperation;
    readonly properties: InsertProperties | DeleteProperties | ReplaceProperties;
    readonly charactersInserted: number;
    readonly charactersDeleted: number;
    readonly linesInserted: number;
    readonly linesDeleted: number;
}
export declare class InlineSuggestionEditKind {
    readonly edits: IInlineSuggestionEditKindEdit[];
    constructor(edits: IInlineSuggestionEditKindEdit[]);
    toString(): string;
}
export declare function computeEditKind(edit: StringEdit, textModel: ITextModel, cursorPosition?: Position): InlineSuggestionEditKind | undefined;
export {};
