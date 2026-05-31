
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { illegalArgument } from '../../../../base/common/errors.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Position } from './position.js';

var Range_1;
let Range = Range_1 = class Range {
    static isRange(thing) {
        if (thing instanceof Range_1) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return Position.isPosition(thing.start) && Position.isPosition(thing.end);
    }
    static of(obj) {
        if (obj instanceof Range_1) {
            return obj;
        }
        if (this.isRange(obj)) {
            return ( new Range_1(obj.start, obj.end));
        }
        throw ( new Error("Invalid argument, is NOT a range-like object"));
    }
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
    constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
        let start;
        let end;
        if (typeof startLineOrStart === "number" && typeof startColumnOrEnd === "number" && typeof endLine === "number" && typeof endColumn === "number") {
            start = ( new Position(startLineOrStart, startColumnOrEnd));
            end = ( new Position(endLine, endColumn));
        } else if (Position.isPosition(startLineOrStart) && Position.isPosition(startColumnOrEnd)) {
            start = Position.of(startLineOrStart);
            end = Position.of(startColumnOrEnd);
        }
        if (!start || !end) {
            throw ( new Error("Invalid arguments"));
        }
        if (start.isBefore(end)) {
            this._start = start;
            this._end = end;
        } else {
            this._start = end;
            this._end = start;
        }
    }
    contains(positionOrRange) {
        if (Range_1.isRange(positionOrRange)) {
            return this.contains(positionOrRange.start) && this.contains(positionOrRange.end);
        } else if (Position.isPosition(positionOrRange)) {
            if (Position.of(positionOrRange).isBefore(this._start)) {
                return false;
            }
            if (this._end.isBefore(positionOrRange)) {
                return false;
            }
            return true;
        }
        return false;
    }
    isEqual(other) {
        return this._start.isEqual(other._start) && this._end.isEqual(other._end);
    }
    intersection(other) {
        const start = Position.Max(other.start, this._start);
        const end = Position.Min(other.end, this._end);
        if (start.isAfter(end)) {
            return undefined;
        }
        return ( new Range_1(start, end));
    }
    union(other) {
        if (this.contains(other)) {
            return this;
        } else if (other.contains(this)) {
            return other;
        }
        const start = Position.Min(other.start, this._start);
        const end = Position.Max(other.end, this.end);
        return ( new Range_1(start, end));
    }
    get isEmpty() {
        return this._start.isEqual(this._end);
    }
    get isSingleLine() {
        return this._start.line === this._end.line;
    }
    with(startOrChange, end = this.end) {
        if (startOrChange === null || end === null) {
            throw illegalArgument();
        }
        let start;
        if (!startOrChange) {
            start = this.start;
        } else if (Position.isPosition(startOrChange)) {
            start = startOrChange;
        } else {
            start = startOrChange.start || this.start;
            end = startOrChange.end || this.end;
        }
        if (start.isEqual(this._start) && end.isEqual(this.end)) {
            return this;
        }
        return ( new Range_1(start, end));
    }
    toJSON() {
        return [this.start, this.end];
    }
    [Symbol.for("debug.description")]() {
        return getDebugDescriptionOfRange(this);
    }
};
Range = Range_1 = ( __decorate([es5ClassCompat], Range));
function getDebugDescriptionOfRange(range) {
    return range.isEmpty ? `[${range.start.line}:${range.start.character})` : `[${range.start.line}:${range.start.character} -> ${range.end.line}:${range.end.character})`;
}

export { Range, getDebugDescriptionOfRange };
