
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { illegalArgument } from '../../../../base/common/errors.js';
import { es5ClassCompat } from './es5ClassCompat.js';

var Position_1;
let Position = Position_1 = class Position {
    static Min(...positions) {
        if (positions.length === 0) {
            throw ( new TypeError());
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isBefore(result)) {
                result = p;
            }
        }
        return result;
    }
    static Max(...positions) {
        if (positions.length === 0) {
            throw ( new TypeError());
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isAfter(result)) {
                result = p;
            }
        }
        return result;
    }
    static isPosition(other) {
        if (!other) {
            return false;
        }
        if (other instanceof Position_1) {
            return true;
        }
        const {
            line,
            character
        } = other;
        if (typeof line === "number" && typeof character === "number") {
            return true;
        }
        return false;
    }
    static of(obj) {
        if (obj instanceof Position_1) {
            return obj;
        } else if (this.isPosition(obj)) {
            return ( new Position_1(obj.line, obj.character));
        }
        throw ( new Error("Invalid argument, is NOT a position-like object"));
    }
    get line() {
        return this._line;
    }
    get character() {
        return this._character;
    }
    constructor(line, character) {
        if (line < 0) {
            throw illegalArgument("line must be non-negative");
        }
        if (character < 0) {
            throw illegalArgument("character must be non-negative");
        }
        this._line = line;
        this._character = character;
    }
    isBefore(other) {
        if (this._line < other._line) {
            return true;
        }
        if (other._line < this._line) {
            return false;
        }
        return this._character < other._character;
    }
    isBeforeOrEqual(other) {
        if (this._line < other._line) {
            return true;
        }
        if (other._line < this._line) {
            return false;
        }
        return this._character <= other._character;
    }
    isAfter(other) {
        return !this.isBeforeOrEqual(other);
    }
    isAfterOrEqual(other) {
        return !this.isBefore(other);
    }
    isEqual(other) {
        return this._line === other._line && this._character === other._character;
    }
    compareTo(other) {
        if (this._line < other._line) {
            return -1;
        } else if (this._line > other.line) {
            return 1;
        } else {
            if (this._character < other._character) {
                return -1;
            } else if (this._character > other._character) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    translate(lineDeltaOrChange, characterDelta = 0) {
        if (lineDeltaOrChange === null || characterDelta === null) {
            throw illegalArgument();
        }
        let lineDelta;
        if (typeof lineDeltaOrChange === "undefined") {
            lineDelta = 0;
        } else if (typeof lineDeltaOrChange === "number") {
            lineDelta = lineDeltaOrChange;
        } else {
            lineDelta = typeof lineDeltaOrChange.lineDelta === "number" ? lineDeltaOrChange.lineDelta : 0;
            characterDelta = typeof lineDeltaOrChange.characterDelta === "number" ? lineDeltaOrChange.characterDelta : 0;
        }
        if (lineDelta === 0 && characterDelta === 0) {
            return this;
        }
        return ( new Position_1(this.line + lineDelta, this.character + characterDelta));
    }
    with(lineOrChange, character = this.character) {
        if (lineOrChange === null || character === null) {
            throw illegalArgument();
        }
        let line;
        if (typeof lineOrChange === "undefined") {
            line = this.line;
        } else if (typeof lineOrChange === "number") {
            line = lineOrChange;
        } else {
            line = typeof lineOrChange.line === "number" ? lineOrChange.line : this.line;
            character = typeof lineOrChange.character === "number" ? lineOrChange.character : this.character;
        }
        if (line === this.line && character === this.character) {
            return this;
        }
        return ( new Position_1(line, character));
    }
    toJSON() {
        return {
            line: this.line,
            character: this.character
        };
    }
    [Symbol.for("debug.description")]() {
        return `(${this.line}:${this.character})`;
    }
};
Position = Position_1 = ( __decorate([es5ClassCompat], Position));

export { Position };
