
import { Position } from './position.js';
import { Range } from './range.js';

var SelectionDirection;
(function(SelectionDirection) {
    SelectionDirection[SelectionDirection["LTR"] = 0] = "LTR";
    SelectionDirection[SelectionDirection["RTL"] = 1] = "RTL";
})(SelectionDirection || (SelectionDirection = {}));
class Selection extends Range {
    constructor(
        selectionStartLineNumber,
        selectionStartColumn,
        positionLineNumber,
        positionColumn
    ) {
        super(
            selectionStartLineNumber,
            selectionStartColumn,
            positionLineNumber,
            positionColumn
        );
        this.selectionStartLineNumber = selectionStartLineNumber;
        this.selectionStartColumn = selectionStartColumn;
        this.positionLineNumber = positionLineNumber;
        this.positionColumn = positionColumn;
    }
    toString() {
        return "[" + this.selectionStartLineNumber + "," + this.selectionStartColumn + " -> " + this.positionLineNumber + "," + this.positionColumn + "]";
    }
    equalsSelection(other) {
        return (Selection.selectionsEqual(this, other));
    }
    static selectionsEqual(a, b) {
        return (a.selectionStartLineNumber === b.selectionStartLineNumber && a.selectionStartColumn === b.selectionStartColumn && a.positionLineNumber === b.positionLineNumber && a.positionColumn === b.positionColumn);
    }
    getDirection() {
        if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
            return SelectionDirection.LTR;
        }
        return SelectionDirection.RTL;
    }
    setEndPosition(endLineNumber, endColumn) {
        if (this.getDirection() === SelectionDirection.LTR) {
            return ( new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn));
        }
        return ( new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn));
    }
    getPosition() {
        return ( new Position(this.positionLineNumber, this.positionColumn));
    }
    getSelectionStart() {
        return ( new Position(this.selectionStartLineNumber, this.selectionStartColumn));
    }
    setStartPosition(startLineNumber, startColumn) {
        if (this.getDirection() === SelectionDirection.LTR) {
            return ( new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn));
        }
        return ( new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn));
    }
    static fromPositions(start, end = start) {
        return ( new Selection(start.lineNumber, start.column, end.lineNumber, end.column));
    }
    static fromRange(range, direction) {
        if (direction === SelectionDirection.LTR) {
            return ( new Selection(
                range.startLineNumber,
                range.startColumn,
                range.endLineNumber,
                range.endColumn
            ));
        } else {
            return ( new Selection(
                range.endLineNumber,
                range.endColumn,
                range.startLineNumber,
                range.startColumn
            ));
        }
    }
    static liftSelection(sel) {
        return ( new Selection(
            sel.selectionStartLineNumber,
            sel.selectionStartColumn,
            sel.positionLineNumber,
            sel.positionColumn
        ));
    }
    static selectionsArrEqual(a, b) {
        if (a && !b || !a && b) {
            return false;
        }
        if (!a && !b) {
            return true;
        }
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0, len = a.length; i < len; i++) {
            if (!this.selectionsEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    static isISelection(obj) {
        return (!!obj && (typeof obj.selectionStartLineNumber === "number") && (typeof obj.selectionStartColumn === "number") && (typeof obj.positionLineNumber === "number") && (typeof obj.positionColumn === "number"));
    }
    static createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, direction) {
        if (direction === SelectionDirection.LTR) {
            return ( new Selection(startLineNumber, startColumn, endLineNumber, endColumn));
        }
        return ( new Selection(endLineNumber, endColumn, startLineNumber, startColumn));
    }
}

export { Selection, SelectionDirection };
