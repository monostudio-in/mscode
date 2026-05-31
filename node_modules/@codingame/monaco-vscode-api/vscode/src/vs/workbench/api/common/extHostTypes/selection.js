
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Position } from './position.js';
import { Range, getDebugDescriptionOfRange } from './range.js';

var Selection_1;
let Selection = Selection_1 = class Selection extends Range {
    static isSelection(thing) {
        if (thing instanceof Selection_1) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return Range.isRange(thing) && Position.isPosition(thing.anchor) && Position.isPosition(thing.active) && typeof thing.isReversed === "boolean";
    }
    get anchor() {
        return this._anchor;
    }
    get active() {
        return this._active;
    }
    constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
        let anchor;
        let active;
        if (typeof anchorLineOrAnchor === "number" && typeof anchorColumnOrActive === "number" && typeof activeLine === "number" && typeof activeColumn === "number") {
            anchor = ( new Position(anchorLineOrAnchor, anchorColumnOrActive));
            active = ( new Position(activeLine, activeColumn));
        } else if (Position.isPosition(anchorLineOrAnchor) && Position.isPosition(anchorColumnOrActive)) {
            anchor = Position.of(anchorLineOrAnchor);
            active = Position.of(anchorColumnOrActive);
        }
        if (!anchor || !active) {
            throw ( new Error("Invalid arguments"));
        }
        super(anchor, active);
        this._anchor = anchor;
        this._active = active;
    }
    get isReversed() {
        return this._anchor === this._end;
    }
    toJSON() {
        return {
            start: this.start,
            end: this.end,
            active: this.active,
            anchor: this.anchor
        };
    }
    [Symbol.for("debug.description")]() {
        return getDebugDescriptionOfSelection(this);
    }
};
Selection = Selection_1 = ( __decorate([es5ClassCompat], Selection));
function getDebugDescriptionOfSelection(selection) {
    let rangeStr = getDebugDescriptionOfRange(selection);
    if (!selection.isEmpty) {
        if (selection.active.isEqual(selection.start)) {
            rangeStr = `|${rangeStr}`;
        } else {
            rangeStr = `${rangeStr}|`;
        }
    }
    return rangeStr;
}

export { Selection, getDebugDescriptionOfSelection };
