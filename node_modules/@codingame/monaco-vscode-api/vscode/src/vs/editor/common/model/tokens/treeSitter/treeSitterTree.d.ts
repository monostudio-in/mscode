import type * as TreeSitter from "../../../../../../../../external/@vscode/tree-sitter-wasm/wasm/tree-sitter.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IObservableWithChange } from "../../../../../base/common/observable.js";
import { ILogService } from "../../../../../platform/log/common/log.service.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.service.js";
import { IModelContentChangedEvent } from "../../../textModelEvents.js";
import { TextModel } from "../../textModel.js";
import { Range } from "../../../core/range.js";
export declare class TreeSitterTree extends Disposable {
    readonly languageId: string;
    private _ranges;
    /** Must have the language set! */
    private readonly _parser;
    private readonly _parserClass;
    readonly textModel: TextModel;
    private readonly _logService;
    private readonly _telemetryService;
    private readonly _tree;
    readonly tree: IObservableWithChange<TreeSitter.Tree | undefined, TreeParseUpdateEvent>;
    private readonly _treeLastParsedVersion;
    readonly treeLastParsedVersion: IObservable<number>;
    private _lastFullyParsed;
    private _lastFullyParsedWithEdits;
    private _onDidChangeContentQueue;
    constructor(languageId: string, _ranges: TreeSitter.Range[] | undefined, 
    /** Must have the language set! */
    _parser: TreeSitter.Parser, _parserClass: typeof TreeSitter.Parser, textModel: TextModel, _logService: ILogService, _telemetryService: ITelemetryService);
    handleContentChange(e: IModelContentChangedEvent | undefined, ranges?: TreeSitter.Range[]): void;
    get ranges(): TreeSitter.Range[] | undefined;
    getInjectionTrees(startIndex: number, languageId: string): TreeSitterTree | undefined;
    private _applyEdits;
    private _findChangedNodes;
    private _findTreeChanges;
    private _constrainRanges;
    private _parseAndUpdateTree;
    private _parse;
    private _parseAndYield;
    private _parseCallback;
    private _setRanges;
    private _sendParseTimeTelemetry;
    createParsedTreeSync(src: string): TreeSitter.Tree | undefined;
}
export interface TreeParseUpdateEvent {
    ranges: RangeChange[];
    versionId: number;
}
export interface RangeWithOffsets {
    range: Range;
    startOffset: number;
    endOffset: number;
}
export interface RangeChange {
    newRange: Range;
    newRangeStartOffset: number;
    newRangeEndOffset: number;
}
export declare function rangesEqual(a: TreeSitter.Range, b: TreeSitter.Range): boolean;
export declare function rangesIntersect(a: TreeSitter.Range, b: TreeSitter.Range): boolean;
