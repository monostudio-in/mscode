import type * as vscode from "vscode";
import { Position } from "./position.js";
import { Range } from "./range.js";
export declare class Selection extends Range {
    static isSelection(thing: unknown): thing is Selection;
    private _anchor;
    get anchor(): Position;
    private _active;
    get active(): Position;
    constructor(anchor: Position, active: Position);
    constructor(anchorLine: number, anchorColumn: number, activeLine: number, activeColumn: number);
    get isReversed(): boolean;
    toJSON(): {
        start: Position;
        end: Position;
        active: Position;
        anchor: Position;
    };
}
export declare function getDebugDescriptionOfSelection(selection: vscode.Selection): string;
