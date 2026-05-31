import type * as vscode from "vscode";
import { SnippetString } from "./snippetString.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
export declare class SnippetTextEdit implements vscode.SnippetTextEdit {
    static isSnippetTextEdit(thing: unknown): thing is SnippetTextEdit;
    static replace(range: Range, snippet: SnippetString): SnippetTextEdit;
    static insert(position: Position, snippet: SnippetString): SnippetTextEdit;
    range: Range;
    snippet: SnippetString;
    keepWhitespace?: boolean;
    constructor(range: Range, snippet: SnippetString);
}
