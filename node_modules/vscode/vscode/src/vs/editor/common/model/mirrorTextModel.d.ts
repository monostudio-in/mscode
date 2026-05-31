import { URI } from "../../../base/common/uri.js";
import { IRange } from "../core/range.js";
import { PrefixSumComputer } from "./prefixSumComputer.js";
export interface IModelContentChange {
    /**
     * The old range that got replaced.
     */
    readonly range: IRange;
    /**
     * The offset of the range that got replaced.
     */
    readonly rangeOffset: number;
    /**
     * The length of the range that got replaced.
     */
    readonly rangeLength: number;
    /**
     * The new text for the range.
     */
    readonly text: string;
}
export interface IModelChangedEvent {
    /**
     * The actual changes.
     */
    readonly changes: IModelContentChange[];
    /**
     * The (new) end-of-line character.
     */
    readonly eol: string;
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
}
export interface IMirrorTextModel {
    readonly version: number;
}
export declare class MirrorTextModel implements IMirrorTextModel {
    protected _uri: URI;
    protected _lines: string[];
    protected _eol: string;
    protected _versionId: number;
    protected _lineStarts: PrefixSumComputer | null;
    private _cachedTextValue;
    constructor(uri: URI, lines: string[], eol: string, versionId: number);
    dispose(): void;
    get version(): number;
    getText(): string;
    onEvents(e: IModelChangedEvent): void;
    protected _ensureLineStarts(): void;
    /**
     * All changes to a line's text go through this method
     */
    private _setLineText;
    private _acceptDeleteRange;
    private _acceptInsertText;
}
