
import { sumBy } from '../../../../base/common/arrays.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { OffsetRange } from '../ranges/offsetRange.js';

class BaseEdit {
    constructor(replacements) {
        this.replacements = replacements;
        let lastEndEx = -1;
        for (const replacement of replacements) {
            if (!(replacement.replaceRange.start >= lastEndEx)) {
                throw ( new BugIndicatingError(
                    `Edits must be disjoint and sorted. Found ${replacement} after ${lastEndEx}`
                ));
            }
            lastEndEx = replacement.replaceRange.endExclusive;
        }
    }
    equals(other) {
        if (this.replacements.length !== other.replacements.length) {
            return false;
        }
        for (let i = 0; i < this.replacements.length; i++) {
            if (!this.replacements[i].equals(other.replacements[i])) {
                return false;
            }
        }
        return true;
    }
    toString() {
        const edits = ( this.replacements.map(e => ( e.toString()))).join(", ");
        return `[${edits}]`;
    }
    normalize() {
        const newReplacements = [];
        let lastReplacement;
        for (const r of this.replacements) {
            if (r.getNewLength() === 0 && r.replaceRange.length === 0) {
                continue;
            }
            if (lastReplacement && lastReplacement.replaceRange.endExclusive === r.replaceRange.start) {
                const joined = lastReplacement.tryJoinTouching(r);
                if (joined) {
                    lastReplacement = joined;
                    continue;
                }
            }
            if (lastReplacement) {
                newReplacements.push(lastReplacement);
            }
            lastReplacement = r;
        }
        if (lastReplacement) {
            newReplacements.push(lastReplacement);
        }
        return this._createNew(newReplacements);
    }
    compose(other) {
        const edits1 = this.normalize();
        const edits2 = other.normalize();
        if (edits1.isEmpty()) {
            return edits2;
        }
        if (edits2.isEmpty()) {
            return edits1;
        }
        const edit1Queue = [...edits1.replacements];
        const result = [];
        let edit1ToEdit2 = 0;
        for (const r2 of edits2.replacements) {
            while (true) {
                const r1 = edit1Queue[0];
                if (!r1 || r1.replaceRange.start + edit1ToEdit2 + r1.getNewLength() >= r2.replaceRange.start) {
                    break;
                }
                edit1Queue.shift();
                result.push(r1);
                edit1ToEdit2 += r1.getNewLength() - r1.replaceRange.length;
            }
            const firstEdit1ToEdit2 = edit1ToEdit2;
            let firstIntersecting;
            let lastIntersecting;
            while (true) {
                const r1 = edit1Queue[0];
                if (!r1 || r1.replaceRange.start + edit1ToEdit2 > r2.replaceRange.endExclusive) {
                    break;
                }
                if (!firstIntersecting) {
                    firstIntersecting = r1;
                }
                lastIntersecting = r1;
                edit1Queue.shift();
                edit1ToEdit2 += r1.getNewLength() - r1.replaceRange.length;
            }
            if (!firstIntersecting) {
                result.push(r2.delta(-edit1ToEdit2));
            } else {
                const newReplaceRangeStart = Math.min(
                    firstIntersecting.replaceRange.start,
                    r2.replaceRange.start - firstEdit1ToEdit2
                );
                const prefixLength = r2.replaceRange.start - (firstIntersecting.replaceRange.start + firstEdit1ToEdit2);
                if (prefixLength > 0) {
                    const prefix = firstIntersecting.slice(OffsetRange.emptyAt(newReplaceRangeStart), ( new OffsetRange(0, prefixLength)));
                    result.push(prefix);
                }
                if (!lastIntersecting) {
                    throw ( new BugIndicatingError(`Invariant violation: lastIntersecting is undefined`));
                }
                const suffixLength = (lastIntersecting.replaceRange.endExclusive + edit1ToEdit2) - r2.replaceRange.endExclusive;
                if (suffixLength > 0) {
                    const e = lastIntersecting.slice(
                        OffsetRange.ofStartAndLength(lastIntersecting.replaceRange.endExclusive, 0),
                        ( new OffsetRange(
                            lastIntersecting.getNewLength() - suffixLength,
                            lastIntersecting.getNewLength()
                        ))
                    );
                    edit1Queue.unshift(e);
                    edit1ToEdit2 -= e.getNewLength() - e.replaceRange.length;
                }
                const newReplaceRange = ( new OffsetRange(newReplaceRangeStart, r2.replaceRange.endExclusive - edit1ToEdit2));
                const middle = r2.slice(newReplaceRange, ( new OffsetRange(0, r2.getNewLength())));
                result.push(middle);
            }
        }
        while (true) {
            const item = edit1Queue.shift();
            if (!item) {
                break;
            }
            result.push(item);
        }
        return this._createNew(result).normalize();
    }
    decomposeSplit(shouldBeInE1) {
        const e1 = [];
        const e2 = [];
        let e2delta = 0;
        for (const edit of this.replacements) {
            if (shouldBeInE1(edit)) {
                e1.push(edit);
                e2delta += edit.getNewLength() - edit.replaceRange.length;
            } else {
                e2.push(edit.slice(edit.replaceRange.delta(e2delta), ( new OffsetRange(0, edit.getNewLength()))));
            }
        }
        return {
            e1: this._createNew(e1),
            e2: this._createNew(e2)
        };
    }
    getNewRanges() {
        const ranges = [];
        let offset = 0;
        for (const e of this.replacements) {
            ranges.push(
                OffsetRange.ofStartAndLength(e.replaceRange.start + offset, e.getNewLength())
            );
            offset += e.getLengthDelta();
        }
        return ranges;
    }
    getJoinedReplaceRange() {
        if (this.replacements.length === 0) {
            return undefined;
        }
        return this.replacements[0].replaceRange.join(this.replacements.at(-1).replaceRange);
    }
    isEmpty() {
        return this.replacements.length === 0;
    }
    getLengthDelta() {
        return sumBy(this.replacements, replacement => replacement.getLengthDelta());
    }
    getNewDataLength(dataLength) {
        return dataLength + this.getLengthDelta();
    }
    applyToOffset(originalOffset) {
        let accumulatedDelta = 0;
        for (const r of this.replacements) {
            if (r.replaceRange.start <= originalOffset) {
                if (originalOffset < r.replaceRange.endExclusive) {
                    return r.replaceRange.start + accumulatedDelta;
                }
                accumulatedDelta += r.getNewLength() - r.replaceRange.length;
            } else {
                break;
            }
        }
        return originalOffset + accumulatedDelta;
    }
    applyToOffsetRange(originalRange) {
        return ( new OffsetRange(
            this.applyToOffset(originalRange.start),
            this.applyToOffset(originalRange.endExclusive)
        ));
    }
    applyInverseToOffset(postEditsOffset) {
        let accumulatedDelta = 0;
        for (const edit of this.replacements) {
            const editLength = edit.getNewLength();
            if (edit.replaceRange.start <= postEditsOffset - accumulatedDelta) {
                if (postEditsOffset - accumulatedDelta < edit.replaceRange.start + editLength) {
                    return edit.replaceRange.start;
                }
                accumulatedDelta += editLength - edit.replaceRange.length;
            } else {
                break;
            }
        }
        return postEditsOffset - accumulatedDelta;
    }
    applyToOffsetOrUndefined(originalOffset) {
        let accumulatedDelta = 0;
        for (const edit of this.replacements) {
            if (edit.replaceRange.start <= originalOffset) {
                if (originalOffset < edit.replaceRange.endExclusive) {
                    return undefined;
                }
                accumulatedDelta += edit.getNewLength() - edit.replaceRange.length;
            } else {
                break;
            }
        }
        return originalOffset + accumulatedDelta;
    }
    applyToOffsetRangeOrUndefined(originalRange) {
        const start = this.applyToOffsetOrUndefined(originalRange.start);
        if (start === undefined) {
            return undefined;
        }
        const end = this.applyToOffsetOrUndefined(originalRange.endExclusive);
        if (end === undefined) {
            return undefined;
        }
        return ( new OffsetRange(start, end));
    }
}
class BaseReplacement {
    constructor(
        replaceRange
    ) {
        this.replaceRange = replaceRange;
    }
    delta(offset) {
        return this.slice(this.replaceRange.delta(offset), ( new OffsetRange(0, this.getNewLength())));
    }
    getLengthDelta() {
        return this.getNewLength() - this.replaceRange.length;
    }
    toString() {
        return `{ ${( this.replaceRange.toString())} -> ${this.getNewLength()} }`;
    }
    get isEmpty() {
        return this.getNewLength() === 0 && this.replaceRange.length === 0;
    }
    getRangeAfterReplace() {
        return ( new OffsetRange(this.replaceRange.start, this.replaceRange.start + this.getNewLength()));
    }
}
class Edit extends BaseEdit {
    static {
        this.empty = ( new Edit([]));
    }
    static create(replacements) {
        return ( new Edit(replacements));
    }
    static single(replacement) {
        return ( new Edit([replacement]));
    }
    _createNew(replacements) {
        return ( new Edit(replacements));
    }
}

export { BaseEdit, BaseReplacement, Edit };
