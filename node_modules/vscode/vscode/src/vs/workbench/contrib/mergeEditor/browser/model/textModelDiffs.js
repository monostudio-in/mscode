
import { compareBy, numberComparator } from '../../../../../base/common/arrays.js';
import { BugIndicatingError } from '../../../../../base/common/errors.js';
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { DetailedLineRangeMapping } from './mapping.js';
import { LineRangeEdit } from './editing.js';
import { MergeEditorLineRange } from './lineRange.js';
import { ReentrancyBarrier } from '../../../../../base/common/controlFlow.js';
import '../../../../../base/common/observableInternal/index.js';
import { observableValue } from '../../../../../base/common/observableInternal/observables/observableValue.js';
import { observableSignal } from '../../../../../base/common/observableInternal/observables/observableSignal.js';
import { autorun } from '../../../../../base/common/observableInternal/reactions/autorun.js';
import { transaction } from '../../../../../base/common/observableInternal/transaction.js';

class TextModelDiffs extends Disposable {
    get isApplyingChange() {
        return this._barrier.isOccupied;
    }
    constructor(baseTextModel, textModel, diffComputer) {
        super();
        this.baseTextModel = baseTextModel;
        this.textModel = textModel;
        this.diffComputer = diffComputer;
        this._recomputeCount = 0;
        this._state = observableValue(this, TextModelDiffState.initializing);
        this._diffs = observableValue(this, []);
        this._barrier = ( new ReentrancyBarrier());
        this._isDisposed = false;
        this._isInitializing = true;
        const recomputeSignal = observableSignal("recompute");
        this._register(autorun(reader => {
            recomputeSignal.read(reader);
            this._recompute(reader);
        }));
        this._register(baseTextModel.onDidChangeContent(this._barrier.makeExclusiveOrSkip(() => {
            recomputeSignal.trigger(undefined);
        })));
        this._register(textModel.onDidChangeContent(this._barrier.makeExclusiveOrSkip(() => {
            recomputeSignal.trigger(undefined);
        })));
        this._register(toDisposable(() => {
            this._isDisposed = true;
        }));
    }
    get state() {
        return this._state;
    }
    get diffs() {
        return this._diffs;
    }
    _recompute(reader) {
        this._recomputeCount++;
        const currentRecomputeIdx = this._recomputeCount;
        if (this._state.get() === TextModelDiffState.initializing) {
            this._isInitializing = true;
        }
        transaction(tx => {
            this._state.set(
                this._isInitializing ? TextModelDiffState.initializing : TextModelDiffState.updating,
                tx,
                TextModelDiffChangeReason.other
            );
        });
        const result = this.diffComputer.computeDiff(this.baseTextModel, this.textModel, reader);
        result.then(result => {
            if (this._isDisposed) {
                return;
            }
            if (currentRecomputeIdx !== this._recomputeCount) {
                return;
            }
            transaction(tx => {
                if (result.diffs) {
                    this._state.set(TextModelDiffState.upToDate, tx, TextModelDiffChangeReason.textChange);
                    this._diffs.set(result.diffs, tx, TextModelDiffChangeReason.textChange);
                } else {
                    this._state.set(TextModelDiffState.error, tx, TextModelDiffChangeReason.textChange);
                }
                this._isInitializing = false;
            });
        });
    }
    ensureUpToDate() {
        if (this.state.get() !== TextModelDiffState.upToDate) {
            throw ( new BugIndicatingError("Cannot remove diffs when the model is not up to date"));
        }
    }
    removeDiffs(diffToRemoves, transaction, group) {
        this.ensureUpToDate();
        diffToRemoves.sort(compareBy(d => d.inputRange.startLineNumber, numberComparator));
        diffToRemoves.reverse();
        const diffs = this._diffs.get();
        const toRemoveSet = ( new Set(diffToRemoves));
        if (toRemoveSet.size !== diffToRemoves.length) {
            throw ( new BugIndicatingError());
        }
        const diffsSet = ( new Set(diffs));
        for (const d of diffToRemoves) {
            if (!( diffsSet.has(d))) {
                throw ( new BugIndicatingError());
            }
        }
        for (const diffToRemove of diffToRemoves) {
            this._barrier.runExclusivelyOrThrow(() => {
                const edits = diffToRemove.getReverseLineEdit().toEdits(this.textModel.getLineCount());
                this.textModel.pushEditOperations(null, edits, () => null, group);
            });
        }
        let cumulativeDelta = 0;
        const newDiffs = [];
        for (const d of diffs) {
            if (( toRemoveSet.has(d))) {
                cumulativeDelta += d.inputRange.length - d.outputRange.length;
            } else {
                newDiffs.push(cumulativeDelta !== 0 ? d.addOutputLineDelta(cumulativeDelta) : d);
            }
        }
        this._diffs.set(newDiffs, transaction, TextModelDiffChangeReason.other);
    }
    applyEditRelativeToOriginal(edit, transaction, group) {
        this.ensureUpToDate();
        const editMapping = ( new DetailedLineRangeMapping(
            edit.range,
            this.baseTextModel,
            MergeEditorLineRange.fromLength(edit.range.startLineNumber, edit.newLines.length),
            this.textModel
        ));
        let firstAfter = false;
        let delta = 0;
        const newDiffs = ( new Array());
        for (const diff of this.diffs.get()) {
            if (diff.inputRange.intersectsOrTouches(edit.range)) {
                throw ( new BugIndicatingError("Edit must be conflict free."));
            } else if (diff.inputRange.isAfter(edit.range)) {
                if (!firstAfter) {
                    firstAfter = true;
                    newDiffs.push(editMapping.addOutputLineDelta(delta));
                }
                newDiffs.push(diff.addOutputLineDelta(edit.newLines.length - edit.range.length));
            } else {
                newDiffs.push(diff);
            }
            if (!firstAfter) {
                delta += diff.outputRange.length - diff.inputRange.length;
            }
        }
        if (!firstAfter) {
            firstAfter = true;
            newDiffs.push(editMapping.addOutputLineDelta(delta));
        }
        this._barrier.runExclusivelyOrThrow(() => {
            const edits = ( new LineRangeEdit(edit.range.delta(delta), edit.newLines)).toEdits(this.textModel.getLineCount());
            this.textModel.pushEditOperations(null, edits, () => null, group);
        });
        this._diffs.set(newDiffs, transaction, TextModelDiffChangeReason.other);
    }
    findTouchingDiffs(baseRange) {
        return this.diffs.get().filter(d => d.inputRange.intersectsOrTouches(baseRange));
    }
    getResultLine(lineNumber, reader) {
        let offset = 0;
        const diffs = reader ? this.diffs.read(reader) : this.diffs.get();
        for (const diff of diffs) {
            if (diff.inputRange.contains(lineNumber) || diff.inputRange.endLineNumberExclusive === lineNumber) {
                return diff;
            } else if (diff.inputRange.endLineNumberExclusive < lineNumber) {
                offset = diff.resultingDeltaFromOriginalToModified;
            } else {
                break;
            }
        }
        return lineNumber + offset;
    }
    getResultLineRange(baseRange, reader) {
        let start = this.getResultLine(baseRange.startLineNumber, reader);
        if (typeof start !== "number") {
            start = start.outputRange.startLineNumber;
        }
        let endExclusive = this.getResultLine(baseRange.endLineNumberExclusive, reader);
        if (typeof endExclusive !== "number") {
            endExclusive = endExclusive.outputRange.endLineNumberExclusive;
        }
        return MergeEditorLineRange.fromLineNumbers(start, endExclusive);
    }
}
var TextModelDiffChangeReason;
(function(TextModelDiffChangeReason) {
    TextModelDiffChangeReason[TextModelDiffChangeReason["other"] = 0] = "other";
    TextModelDiffChangeReason[TextModelDiffChangeReason["textChange"] = 1] = "textChange";
})(TextModelDiffChangeReason || (TextModelDiffChangeReason = {}));
var TextModelDiffState;
(function(TextModelDiffState) {
    TextModelDiffState[TextModelDiffState["initializing"] = 1] = "initializing";
    TextModelDiffState[TextModelDiffState["upToDate"] = 2] = "upToDate";
    TextModelDiffState[TextModelDiffState["updating"] = 3] = "updating";
    TextModelDiffState[TextModelDiffState["error"] = 4] = "error";
})(TextModelDiffState || (TextModelDiffState = {}));

export { TextModelDiffChangeReason, TextModelDiffState, TextModelDiffs };
