import type * as vscode from "vscode";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
export declare class Location {
    static isLocation(thing: unknown): thing is vscode.Location;
    uri: URI;
    range: Range;
    constructor(uri: URI, rangeOrPosition: Range | Position);
    toJSON(): any;
}
