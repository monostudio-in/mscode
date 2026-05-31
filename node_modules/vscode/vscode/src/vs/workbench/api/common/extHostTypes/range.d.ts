import type * as vscode from "vscode";
import { Position } from "./position.js";
export declare class Range {
    static isRange(thing: unknown): thing is vscode.Range;
    static of(obj: vscode.Range): Range;
    protected _start: Position;
    protected _end: Position;
    get start(): Position;
    get end(): Position;
    constructor(start: vscode.Position, end: vscode.Position);
    constructor(start: Position, end: Position);
    constructor(startLine: number, startColumn: number, endLine: number, endColumn: number);
    contains(positionOrRange: Position | Range): boolean;
    isEqual(other: Range): boolean;
    intersection(other: Range): Range | undefined;
    union(other: Range): Range;
    get isEmpty(): boolean;
    get isSingleLine(): boolean;
    with(change: {
        start?: Position;
        end?: Position;
    }): Range;
    with(start?: Position, end?: Position): Range;
    toJSON(): unknown;
}
export declare function getDebugDescriptionOfRange(range: vscode.Range): string;
