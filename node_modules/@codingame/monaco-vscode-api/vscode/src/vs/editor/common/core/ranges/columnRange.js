
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { OffsetRange } from './offsetRange.js';
import { Range } from '../range.js';

class ColumnRange {
    static fromOffsetRange(offsetRange) {
        return ( new ColumnRange(offsetRange.start + 1, offsetRange.endExclusive + 1));
    }
    constructor(
        startColumn,
        endColumnExclusive
    ) {
        this.startColumn = startColumn;
        this.endColumnExclusive = endColumnExclusive;
        if (startColumn > endColumnExclusive) {
            throw ( new BugIndicatingError(
                `startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`
            ));
        }
    }
    toRange(lineNumber) {
        return ( new Range(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive));
    }
    equals(other) {
        return this.startColumn === other.startColumn && this.endColumnExclusive === other.endColumnExclusive;
    }
    toZeroBasedOffsetRange() {
        return ( new OffsetRange(this.startColumn - 1, this.endColumnExclusive - 1));
    }
}

export { ColumnRange };
