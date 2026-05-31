
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { illegalArgument } from '../../../../base/common/errors.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Position } from './position.js';
import { Range } from './range.js';

var TextEdit_1;
var EndOfLine;
(function(EndOfLine) {
    EndOfLine[EndOfLine["LF"] = 1] = "LF";
    EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
})(EndOfLine || (EndOfLine = {}));
let TextEdit = TextEdit_1 = class TextEdit {
    static isTextEdit(thing) {
        if (thing instanceof TextEdit_1) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return Range.isRange(thing) && typeof thing.newText === "string";
    }
    static replace(range, newText) {
        return ( new TextEdit_1(range, newText));
    }
    static insert(position, newText) {
        return TextEdit_1.replace(( new Range(position, position)), newText);
    }
    static delete(range) {
        return TextEdit_1.replace(range, "");
    }
    static setEndOfLine(eol) {
        const ret = ( new TextEdit_1(( new Range(( new Position(0, 0)), ( new Position(0, 0)))), ""));
        ret.newEol = eol;
        return ret;
    }
    get range() {
        return this._range;
    }
    set range(value) {
        if (value && !Range.isRange(value)) {
            throw illegalArgument("range");
        }
        this._range = value;
    }
    get newText() {
        return this._newText || "";
    }
    set newText(value) {
        if (value && typeof value !== "string") {
            throw illegalArgument("newText");
        }
        this._newText = value;
    }
    get newEol() {
        return this._newEol;
    }
    set newEol(value) {
        if (value && typeof value !== "number") {
            throw illegalArgument("newEol");
        }
        this._newEol = value;
    }
    constructor(range, newText) {
        this._range = range;
        this._newText = newText;
    }
    toJSON() {
        return {
            range: this.range,
            newText: this.newText,
            newEol: this._newEol
        };
    }
};
TextEdit = TextEdit_1 = ( __decorate([es5ClassCompat], TextEdit));

export { EndOfLine, TextEdit };
