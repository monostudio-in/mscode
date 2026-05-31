import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { DetailedLineRangeMapping } from "./mapping.js";
import { LineRangeEdit } from "./editing.js";
import { MergeEditorLineRange } from "./lineRange.js";
import { IMergeDiffComputer } from "./diffComputer.js";
import { IObservableWithChange, IReader, ITransaction } from "../../../../../base/common/observable.js";
import { UndoRedoGroup } from "../../../../../platform/undoRedo/common/undoRedo.js";
export declare class TextModelDiffs extends Disposable {
    private readonly baseTextModel;
    private readonly textModel;
    private readonly diffComputer;
    private _recomputeCount;
    private readonly _state;
    private readonly _diffs;
    private readonly _barrier;
    private _isDisposed;
    get isApplyingChange(): boolean;
    constructor(baseTextModel: ITextModel, textModel: ITextModel, diffComputer: IMergeDiffComputer);
    get state(): IObservableWithChange<TextModelDiffState, TextModelDiffChangeReason>;
    /**
     * Diffs from base to input.
    */
    get diffs(): IObservableWithChange<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    private _isInitializing;
    private _recompute;
    private ensureUpToDate;
    removeDiffs(diffToRemoves: DetailedLineRangeMapping[], transaction: ITransaction | undefined, group?: UndoRedoGroup): void;
    /**
     * Edit must be conflict free.
     */
    applyEditRelativeToOriginal(edit: LineRangeEdit, transaction: ITransaction | undefined, group?: UndoRedoGroup): void;
    findTouchingDiffs(baseRange: MergeEditorLineRange): DetailedLineRangeMapping[];
    private getResultLine;
    getResultLineRange(baseRange: MergeEditorLineRange, reader?: IReader): MergeEditorLineRange;
}
export declare enum TextModelDiffChangeReason {
    other = 0,
    textChange = 1
}
export declare enum TextModelDiffState {
    initializing = 1,
    upToDate = 2,
    updating = 3,
    error = 4
}
export interface ITextModelDiffsState {
    state: TextModelDiffState;
    diffs: DetailedLineRangeMapping[];
}
