
import { singleLetterHash } from '../../../base/common/strings.js';
import { LineHeightsManager } from './lineHeights.js';

class PendingChanges {
    constructor() {
        this._hasPending = false;
        this._inserts = [];
        this._changes = [];
        this._removes = [];
    }
    insert(x) {
        this._hasPending = true;
        this._inserts.push(x);
    }
    change(x) {
        this._hasPending = true;
        this._changes.push(x);
    }
    remove(x) {
        this._hasPending = true;
        this._removes.push(x);
    }
    commit(linesLayout) {
        if (!this._hasPending) {
            return;
        }
        const inserts = this._inserts;
        const changes = this._changes;
        const removes = this._removes;
        this._hasPending = false;
        this._inserts = [];
        this._changes = [];
        this._removes = [];
        linesLayout._commitPendingChanges(inserts, changes, removes);
    }
}
class EditorWhitespace {
    constructor(id, afterLineNumber, ordinal, height, minWidth) {
        this.id = id;
        this.afterLineNumber = afterLineNumber;
        this.ordinal = ordinal;
        this.height = height;
        this.minWidth = minWidth;
        this.prefixSum = 0;
    }
}
class LinesLayout {
    static {
        this.INSTANCE_COUNT = 0;
    }
    constructor(
        lineCount,
        defaultLineHeight,
        paddingTop,
        paddingBottom,
        customLineHeightData
    ) {
        this._instanceId = singleLetterHash(++LinesLayout.INSTANCE_COUNT);
        this._pendingChanges = ( new PendingChanges());
        this._lastWhitespaceId = 0;
        this._arr = [];
        this._prefixSumValidIndex = -1;
        this._minWidth = -1;
        this._lineCount = lineCount;
        this._paddingTop = paddingTop;
        this._paddingBottom = paddingBottom;
        this._lineHeightsManager = ( new LineHeightsManager(defaultLineHeight, customLineHeightData));
    }
    static findInsertionIndex(arr, afterLineNumber, ordinal) {
        let low = 0;
        let high = arr.length;
        while (low < high) {
            const mid = ((low + high) >>> 1);
            if (afterLineNumber === arr[mid].afterLineNumber) {
                if (ordinal < arr[mid].ordinal) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            } else if (afterLineNumber < arr[mid].afterLineNumber) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return low;
    }
    setDefaultLineHeight(lineHeight) {
        this._lineHeightsManager.defaultLineHeight = lineHeight;
    }
    setPadding(paddingTop, paddingBottom) {
        this._paddingTop = paddingTop;
        this._paddingBottom = paddingBottom;
    }
    onFlushed(lineCount, customLineHeightData) {
        this._lineCount = lineCount;
        this._lineHeightsManager = ( new LineHeightsManager(this._lineHeightsManager.defaultLineHeight, customLineHeightData));
    }
    changeLineHeights(callback) {
        let hadAChange = false;
        const accessor = {
            insertOrChangeCustomLineHeight: (decorationId, startLineNumber, endLineNumber, lineHeight) => {
                hadAChange = true;
                this._lineHeightsManager.insertOrChangeCustomLineHeight(decorationId, startLineNumber, endLineNumber, lineHeight);
            },
            removeCustomLineHeight: decorationId => {
                hadAChange = true;
                this._lineHeightsManager.removeCustomLineHeight(decorationId);
            }
        };
        callback(accessor);
        return hadAChange;
    }
    changeWhitespace(callback) {
        let hadAChange = false;
        try {
            const accessor = {
                insertWhitespace: (afterLineNumber, ordinal, heightInPx, minWidth) => {
                    hadAChange = true;
                    afterLineNumber = afterLineNumber | 0;
                    ordinal = ordinal | 0;
                    heightInPx = heightInPx | 0;
                    minWidth = minWidth | 0;
                    const id = this._instanceId + (++this._lastWhitespaceId);
                    this._pendingChanges.insert(( new EditorWhitespace(id, afterLineNumber, ordinal, heightInPx, minWidth)));
                    return id;
                },
                changeOneWhitespace: (id, newAfterLineNumber, newHeight) => {
                    hadAChange = true;
                    newAfterLineNumber = newAfterLineNumber | 0;
                    newHeight = newHeight | 0;
                    this._pendingChanges.change({
                        id,
                        newAfterLineNumber,
                        newHeight
                    });
                },
                removeWhitespace: id => {
                    hadAChange = true;
                    this._pendingChanges.remove({
                        id
                    });
                }
            };
            callback(accessor);
        } finally {
            this._pendingChanges.commit(this);
        }
        return hadAChange;
    }
    _commitPendingChanges(inserts, changes, removes) {
        if (inserts.length > 0 || removes.length > 0) {
            this._minWidth = -1;
        }
        if (inserts.length + changes.length + removes.length <= 1) {
            for (const insert of inserts) {
                this._insertWhitespace(insert);
            }
            for (const change of changes) {
                this._changeOneWhitespace(change.id, change.newAfterLineNumber, change.newHeight);
            }
            for (const remove of removes) {
                const index = this._findWhitespaceIndex(remove.id);
                if (index === -1) {
                    continue;
                }
                this._removeWhitespace(index);
            }
            return;
        }
        const toRemove = ( new Set());
        for (const remove of removes) {
            toRemove.add(remove.id);
        }
        const toChange = ( new Map());
        for (const change of changes) {
            toChange.set(change.id, change);
        }
        const applyRemoveAndChange = whitespaces => {
            const result = [];
            for (const whitespace of whitespaces) {
                if (( toRemove.has(whitespace.id))) {
                    continue;
                }
                if (( toChange.has(whitespace.id))) {
                    const change = toChange.get(whitespace.id);
                    whitespace.afterLineNumber = change.newAfterLineNumber;
                    whitespace.height = change.newHeight;
                }
                result.push(whitespace);
            }
            return result;
        };
        const result = applyRemoveAndChange(this._arr).concat(applyRemoveAndChange(inserts));
        result.sort((a, b) => {
            if (a.afterLineNumber === b.afterLineNumber) {
                return a.ordinal - b.ordinal;
            }
            return a.afterLineNumber - b.afterLineNumber;
        });
        this._arr = result;
        this._prefixSumValidIndex = -1;
    }
    _insertWhitespace(whitespace) {
        const insertIndex = LinesLayout.findInsertionIndex(this._arr, whitespace.afterLineNumber, whitespace.ordinal);
        this._arr.splice(insertIndex, 0, whitespace);
        this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, insertIndex - 1);
    }
    _findWhitespaceIndex(id) {
        const arr = this._arr;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].id === id) {
                return i;
            }
        }
        return -1;
    }
    _changeOneWhitespace(id, newAfterLineNumber, newHeight) {
        const index = this._findWhitespaceIndex(id);
        if (index === -1) {
            return;
        }
        if (this._arr[index].height !== newHeight) {
            this._arr[index].height = newHeight;
            this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, index - 1);
        }
        if (this._arr[index].afterLineNumber !== newAfterLineNumber) {
            const whitespace = this._arr[index];
            this._removeWhitespace(index);
            whitespace.afterLineNumber = newAfterLineNumber;
            this._insertWhitespace(whitespace);
        }
    }
    _removeWhitespace(removeIndex) {
        this._arr.splice(removeIndex, 1);
        this._prefixSumValidIndex = Math.min(this._prefixSumValidIndex, removeIndex - 1);
    }
    onLinesDeleted(fromLineNumber, toLineNumber) {
        fromLineNumber = fromLineNumber | 0;
        toLineNumber = toLineNumber | 0;
        this._lineCount -= (toLineNumber - fromLineNumber + 1);
        for (let i = 0, len = this._arr.length; i < len; i++) {
            const afterLineNumber = this._arr[i].afterLineNumber;
            if (fromLineNumber <= afterLineNumber && afterLineNumber <= toLineNumber) {
                this._arr[i].afterLineNumber = fromLineNumber - 1;
            } else if (afterLineNumber > toLineNumber) {
                this._arr[i].afterLineNumber -= (toLineNumber - fromLineNumber + 1);
            }
        }
        this._lineHeightsManager.onLinesDeleted(fromLineNumber, toLineNumber);
    }
    onLinesInserted(fromLineNumber, toLineNumber) {
        fromLineNumber = fromLineNumber | 0;
        toLineNumber = toLineNumber | 0;
        this._lineCount += (toLineNumber - fromLineNumber + 1);
        for (let i = 0, len = this._arr.length; i < len; i++) {
            const afterLineNumber = this._arr[i].afterLineNumber;
            if (fromLineNumber <= afterLineNumber) {
                this._arr[i].afterLineNumber += (toLineNumber - fromLineNumber + 1);
            }
        }
        this._lineHeightsManager.onLinesInserted(fromLineNumber, toLineNumber);
    }
    getWhitespacesTotalHeight() {
        if (this._arr.length === 0) {
            return 0;
        }
        return this.getWhitespacesAccumulatedHeight(this._arr.length - 1);
    }
    getWhitespacesAccumulatedHeight(index) {
        index = index | 0;
        let startIndex = Math.max(0, this._prefixSumValidIndex + 1);
        if (startIndex === 0) {
            this._arr[0].prefixSum = this._arr[0].height;
            startIndex++;
        }
        for (let i = startIndex; i <= index; i++) {
            this._arr[i].prefixSum = this._arr[i - 1].prefixSum + this._arr[i].height;
        }
        this._prefixSumValidIndex = Math.max(this._prefixSumValidIndex, index);
        return this._arr[index].prefixSum;
    }
    getLinesTotalHeight() {
        const linesHeight = this._lineHeightsManager.getAccumulatedLineHeightsIncludingLineNumber(this._lineCount);
        const whitespacesHeight = this.getWhitespacesTotalHeight();
        return linesHeight + whitespacesHeight + this._paddingTop + this._paddingBottom;
    }
    getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber) {
        lineNumber = lineNumber | 0;
        const lastWhitespaceBeforeLineNumber = this._findLastWhitespaceBeforeLineNumber(lineNumber);
        if (lastWhitespaceBeforeLineNumber === -1) {
            return 0;
        }
        return this.getWhitespacesAccumulatedHeight(lastWhitespaceBeforeLineNumber);
    }
    _findLastWhitespaceBeforeLineNumber(lineNumber) {
        lineNumber = lineNumber | 0;
        const arr = this._arr;
        let low = 0;
        let high = arr.length - 1;
        while (low <= high) {
            const delta = (high - low) | 0;
            const halfDelta = (delta / 2) | 0;
            const mid = (low + halfDelta) | 0;
            if (arr[mid].afterLineNumber < lineNumber) {
                if (mid + 1 >= arr.length || arr[mid + 1].afterLineNumber >= lineNumber) {
                    return mid;
                } else {
                    low = (mid + 1) | 0;
                }
            } else {
                high = (mid - 1) | 0;
            }
        }
        return -1;
    }
    _findFirstWhitespaceAfterLineNumber(lineNumber) {
        lineNumber = lineNumber | 0;
        const lastWhitespaceBeforeLineNumber = this._findLastWhitespaceBeforeLineNumber(lineNumber);
        const firstWhitespaceAfterLineNumber = lastWhitespaceBeforeLineNumber + 1;
        if (firstWhitespaceAfterLineNumber < this._arr.length) {
            return firstWhitespaceAfterLineNumber;
        }
        return -1;
    }
    getFirstWhitespaceIndexAfterLineNumber(lineNumber) {
        lineNumber = lineNumber | 0;
        return this._findFirstWhitespaceAfterLineNumber(lineNumber);
    }
    getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
        lineNumber = lineNumber | 0;
        let previousLinesHeight;
        if (lineNumber > 1) {
            previousLinesHeight = this._lineHeightsManager.getAccumulatedLineHeightsIncludingLineNumber(lineNumber - 1);
        } else {
            previousLinesHeight = 0;
        }
        const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber - (includeViewZones ? 1 : 0));
        return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
    }
    getLineHeightForLineNumber(lineNumber) {
        return this._lineHeightsManager.heightForLineNumber(lineNumber);
    }
    getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
        lineNumber = lineNumber | 0;
        const previousLinesHeight = this._lineHeightsManager.getAccumulatedLineHeightsIncludingLineNumber(lineNumber);
        const previousWhitespacesHeight = this.getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber + (includeViewZones ? 1 : 0));
        return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
    }
    hasWhitespace() {
        return this.getWhitespacesCount() > 0;
    }
    getWhitespaceMinWidth() {
        if (this._minWidth === -1) {
            let minWidth = 0;
            for (let i = 0, len = this._arr.length; i < len; i++) {
                minWidth = Math.max(minWidth, this._arr[i].minWidth);
            }
            this._minWidth = minWidth;
        }
        return this._minWidth;
    }
    isAfterLines(verticalOffset) {
        const totalHeight = this.getLinesTotalHeight();
        return verticalOffset > totalHeight;
    }
    isInTopPadding(verticalOffset) {
        if (this._paddingTop === 0) {
            return false;
        }
        return (verticalOffset < this._paddingTop);
    }
    isInBottomPadding(verticalOffset) {
        if (this._paddingBottom === 0) {
            return false;
        }
        const totalHeight = this.getLinesTotalHeight();
        return (verticalOffset >= totalHeight - this._paddingBottom);
    }
    getLineNumberAtOrAfterVerticalOffset(verticalOffset) {
        verticalOffset = verticalOffset | 0;
        if (verticalOffset < 0) {
            return 1;
        }
        const linesCount = this._lineCount | 0;
        let minLineNumber = 1;
        let maxLineNumber = linesCount;
        while (minLineNumber < maxLineNumber) {
            const midLineNumber = ((minLineNumber + maxLineNumber) / 2) | 0;
            const lineHeight = this.getLineHeightForLineNumber(midLineNumber);
            const midLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(midLineNumber) | 0;
            if (verticalOffset >= midLineNumberVerticalOffset + lineHeight) {
                minLineNumber = midLineNumber + 1;
            } else if (verticalOffset >= midLineNumberVerticalOffset) {
                return midLineNumber;
            } else {
                maxLineNumber = midLineNumber;
            }
        }
        if (minLineNumber > linesCount) {
            return linesCount;
        }
        return minLineNumber;
    }
    getLinesViewportData(verticalOffset1, verticalOffset2) {
        verticalOffset1 = verticalOffset1 | 0;
        verticalOffset2 = verticalOffset2 | 0;
        const startLineNumber = this.getLineNumberAtOrAfterVerticalOffset(verticalOffset1) | 0;
        const startLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(startLineNumber) | 0;
        let endLineNumber = this._lineCount | 0;
        let whitespaceIndex = this.getFirstWhitespaceIndexAfterLineNumber(startLineNumber) | 0;
        const whitespaceCount = this.getWhitespacesCount() | 0;
        let currentWhitespaceHeight;
        let currentWhitespaceAfterLineNumber;
        if (whitespaceIndex === -1) {
            whitespaceIndex = whitespaceCount;
            currentWhitespaceAfterLineNumber = endLineNumber + 1;
            currentWhitespaceHeight = 0;
        } else {
            currentWhitespaceAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex) | 0;
            currentWhitespaceHeight = this.getHeightForWhitespaceIndex(whitespaceIndex) | 0;
        }
        let currentVerticalOffset = startLineNumberVerticalOffset;
        let currentLineRelativeOffset = currentVerticalOffset;
        const STEP_SIZE = 500000;
        let bigNumbersDelta = 0;
        if (startLineNumberVerticalOffset >= STEP_SIZE) {
            bigNumbersDelta = Math.floor(startLineNumberVerticalOffset / STEP_SIZE) * STEP_SIZE;
            bigNumbersDelta = Math.floor(bigNumbersDelta / this._lineHeightsManager.defaultLineHeight) * this._lineHeightsManager.defaultLineHeight;
            currentLineRelativeOffset -= bigNumbersDelta;
        }
        const linesOffsets = [];
        const verticalCenter = verticalOffset1 + (verticalOffset2 - verticalOffset1) / 2;
        let centeredLineNumber = -1;
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            const lineHeight = this.getLineHeightForLineNumber(lineNumber);
            if (centeredLineNumber === -1) {
                const currentLineTop = currentVerticalOffset;
                const currentLineBottom = currentVerticalOffset + lineHeight;
                if ((currentLineTop <= verticalCenter && verticalCenter < currentLineBottom) || currentLineTop > verticalCenter) {
                    centeredLineNumber = lineNumber;
                }
            }
            currentVerticalOffset += lineHeight;
            linesOffsets[lineNumber - startLineNumber] = currentLineRelativeOffset;
            currentLineRelativeOffset += lineHeight;
            while (currentWhitespaceAfterLineNumber === lineNumber) {
                currentLineRelativeOffset += currentWhitespaceHeight;
                currentVerticalOffset += currentWhitespaceHeight;
                whitespaceIndex++;
                if (whitespaceIndex >= whitespaceCount) {
                    currentWhitespaceAfterLineNumber = endLineNumber + 1;
                } else {
                    currentWhitespaceAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex) | 0;
                    currentWhitespaceHeight = this.getHeightForWhitespaceIndex(whitespaceIndex) | 0;
                }
            }
            if (currentVerticalOffset >= verticalOffset2) {
                endLineNumber = lineNumber;
                break;
            }
        }
        if (centeredLineNumber === -1) {
            centeredLineNumber = endLineNumber;
        }
        const endLineNumberVerticalOffset = this.getVerticalOffsetForLineNumber(endLineNumber) | 0;
        let completelyVisibleStartLineNumber = startLineNumber;
        let completelyVisibleEndLineNumber = endLineNumber;
        if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
            if (startLineNumberVerticalOffset < verticalOffset1) {
                completelyVisibleStartLineNumber++;
            }
        }
        if (completelyVisibleStartLineNumber < completelyVisibleEndLineNumber) {
            const endLineHeight = this.getLineHeightForLineNumber(endLineNumber);
            if (endLineNumberVerticalOffset + endLineHeight > verticalOffset2) {
                completelyVisibleEndLineNumber--;
            }
        }
        return {
            bigNumbersDelta: bigNumbersDelta,
            startLineNumber: startLineNumber,
            endLineNumber: endLineNumber,
            relativeVerticalOffset: linesOffsets,
            centeredLineNumber: centeredLineNumber,
            completelyVisibleStartLineNumber: completelyVisibleStartLineNumber,
            completelyVisibleEndLineNumber: completelyVisibleEndLineNumber,
            lineHeight: this._lineHeightsManager.defaultLineHeight
        };
    }
    getVerticalOffsetForWhitespaceIndex(whitespaceIndex) {
        whitespaceIndex = whitespaceIndex | 0;
        const afterLineNumber = this.getAfterLineNumberForWhitespaceIndex(whitespaceIndex);
        let previousLinesHeight;
        if (afterLineNumber >= 1) {
            previousLinesHeight = this._lineHeightsManager.getAccumulatedLineHeightsIncludingLineNumber(afterLineNumber);
        } else {
            previousLinesHeight = 0;
        }
        let previousWhitespacesHeight;
        if (whitespaceIndex > 0) {
            previousWhitespacesHeight = this.getWhitespacesAccumulatedHeight(whitespaceIndex - 1);
        } else {
            previousWhitespacesHeight = 0;
        }
        return previousLinesHeight + previousWhitespacesHeight + this._paddingTop;
    }
    getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset) {
        verticalOffset = verticalOffset | 0;
        let minWhitespaceIndex = 0;
        let maxWhitespaceIndex = this.getWhitespacesCount() - 1;
        if (maxWhitespaceIndex < 0) {
            return -1;
        }
        const maxWhitespaceVerticalOffset = this.getVerticalOffsetForWhitespaceIndex(maxWhitespaceIndex);
        const maxWhitespaceHeight = this.getHeightForWhitespaceIndex(maxWhitespaceIndex);
        if (verticalOffset >= maxWhitespaceVerticalOffset + maxWhitespaceHeight) {
            return -1;
        }
        while (minWhitespaceIndex < maxWhitespaceIndex) {
            const midWhitespaceIndex = Math.floor((minWhitespaceIndex + maxWhitespaceIndex) / 2);
            const midWhitespaceVerticalOffset = this.getVerticalOffsetForWhitespaceIndex(midWhitespaceIndex);
            const midWhitespaceHeight = this.getHeightForWhitespaceIndex(midWhitespaceIndex);
            if (verticalOffset >= midWhitespaceVerticalOffset + midWhitespaceHeight) {
                minWhitespaceIndex = midWhitespaceIndex + 1;
            } else if (verticalOffset >= midWhitespaceVerticalOffset) {
                return midWhitespaceIndex;
            } else {
                maxWhitespaceIndex = midWhitespaceIndex;
            }
        }
        return minWhitespaceIndex;
    }
    getWhitespaceAtVerticalOffset(verticalOffset) {
        verticalOffset = verticalOffset | 0;
        const candidateIndex = this.getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset);
        if (candidateIndex < 0) {
            return null;
        }
        if (candidateIndex >= this.getWhitespacesCount()) {
            return null;
        }
        const candidateTop = this.getVerticalOffsetForWhitespaceIndex(candidateIndex);
        if (candidateTop > verticalOffset) {
            return null;
        }
        const candidateHeight = this.getHeightForWhitespaceIndex(candidateIndex);
        const candidateId = this.getIdForWhitespaceIndex(candidateIndex);
        const candidateAfterLineNumber = this.getAfterLineNumberForWhitespaceIndex(candidateIndex);
        return {
            id: candidateId,
            afterLineNumber: candidateAfterLineNumber,
            verticalOffset: candidateTop,
            height: candidateHeight
        };
    }
    getWhitespaceViewportData(verticalOffset1, verticalOffset2) {
        verticalOffset1 = verticalOffset1 | 0;
        verticalOffset2 = verticalOffset2 | 0;
        const startIndex = this.getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset1);
        const endIndex = this.getWhitespacesCount() - 1;
        if (startIndex < 0) {
            return [];
        }
        const result = [];
        for (let i = startIndex; i <= endIndex; i++) {
            const top = this.getVerticalOffsetForWhitespaceIndex(i);
            const height = this.getHeightForWhitespaceIndex(i);
            if (top >= verticalOffset2) {
                break;
            }
            result.push({
                id: this.getIdForWhitespaceIndex(i),
                afterLineNumber: this.getAfterLineNumberForWhitespaceIndex(i),
                verticalOffset: top,
                height: height
            });
        }
        return result;
    }
    getWhitespaces() {
        return this._arr.slice(0);
    }
    getWhitespacesCount() {
        return this._arr.length;
    }
    getIdForWhitespaceIndex(index) {
        index = index | 0;
        return this._arr[index].id;
    }
    getAfterLineNumberForWhitespaceIndex(index) {
        index = index | 0;
        return this._arr[index].afterLineNumber;
    }
    getHeightForWhitespaceIndex(index) {
        index = index | 0;
        return this._arr[index].height;
    }
}

export { EditorWhitespace, LinesLayout };
