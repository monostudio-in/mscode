
import { findLastIdxMonotonous, findLastMonotonous, findFirstMonotonous } from '../../../../base/common/arraysFind.js';
import { CharCode } from '../../../../base/common/charCode.js';
import { OffsetRange } from '../../core/ranges/offsetRange.js';
import { Position } from '../../core/position.js';
import { Range } from '../../core/range.js';
import { isSpace } from './utils.js';

class LinesSliceCharSequence {
    constructor(lines, range, considerWhitespaceChanges) {
        this.lines = lines;
        this.range = range;
        this.considerWhitespaceChanges = considerWhitespaceChanges;
        this.elements = [];
        this.firstElementOffsetByLineIdx = [];
        this.lineStartOffsets = [];
        this.trimmedWsLengthsByLineIdx = [];
        this.firstElementOffsetByLineIdx.push(0);
        for (let lineNumber = this.range.startLineNumber; lineNumber <= this.range.endLineNumber; lineNumber++) {
            let line = lines[lineNumber - 1];
            let lineStartOffset = 0;
            if (lineNumber === this.range.startLineNumber && this.range.startColumn > 1) {
                lineStartOffset = this.range.startColumn - 1;
                line = line.substring(lineStartOffset);
            }
            this.lineStartOffsets.push(lineStartOffset);
            let trimmedWsLength = 0;
            if (!considerWhitespaceChanges) {
                const trimmedStartLine = line.trimStart();
                trimmedWsLength = line.length - trimmedStartLine.length;
                line = trimmedStartLine.trimEnd();
            }
            this.trimmedWsLengthsByLineIdx.push(trimmedWsLength);
            const lineLength = lineNumber === this.range.endLineNumber ? Math.min(this.range.endColumn - 1 - lineStartOffset - trimmedWsLength, line.length) : line.length;
            for (let i = 0; i < lineLength; i++) {
                this.elements.push(line.charCodeAt(i));
            }
            if (lineNumber < this.range.endLineNumber) {
                this.elements.push("\n".charCodeAt(0));
                this.firstElementOffsetByLineIdx.push(this.elements.length);
            }
        }
    }
    toString() {
        return `Slice: "${this.text}"`;
    }
    get text() {
        return this.getText(( new OffsetRange(0, this.length)));
    }
    getText(range) {
        return ( this.elements.slice(range.start, range.endExclusive).map(e => String.fromCharCode(e))).join("");
    }
    getElement(offset) {
        return this.elements[offset];
    }
    get length() {
        return this.elements.length;
    }
    getBoundaryScore(length) {
        const prevCategory = getCategory(length > 0 ? this.elements[length - 1] : -1);
        const nextCategory = getCategory(length < this.elements.length ? this.elements[length] : -1);
        if (prevCategory === CharBoundaryCategory.LineBreakCR && nextCategory === CharBoundaryCategory.LineBreakLF) {
            return 0;
        }
        if (prevCategory === CharBoundaryCategory.LineBreakLF) {
            return 150;
        }
        let score = 0;
        if (prevCategory !== nextCategory) {
            score += 10;
            if (prevCategory === CharBoundaryCategory.WordLower && nextCategory === CharBoundaryCategory.WordUpper) {
                score += 1;
            }
        }
        score += getCategoryBoundaryScore(prevCategory);
        score += getCategoryBoundaryScore(nextCategory);
        return score;
    }
    translateOffset(offset, preference = "right") {
        const i = findLastIdxMonotonous(this.firstElementOffsetByLineIdx, value => value <= offset);
        const lineOffset = offset - this.firstElementOffsetByLineIdx[i];
        return ( new Position(
            this.range.startLineNumber + i,
            1 + this.lineStartOffsets[i] + lineOffset + ((lineOffset === 0 && preference === "left") ? 0 : this.trimmedWsLengthsByLineIdx[i])
        ));
    }
    translateRange(range) {
        const pos1 = this.translateOffset(range.start, "right");
        const pos2 = this.translateOffset(range.endExclusive, "left");
        if (pos2.isBefore(pos1)) {
            return Range.fromPositions(pos2, pos2);
        }
        return Range.fromPositions(pos1, pos2);
    }
    findWordContaining(offset) {
        if (offset < 0 || offset >= this.elements.length) {
            return undefined;
        }
        if (!isWordChar(this.elements[offset])) {
            return undefined;
        }
        let start = offset;
        while (start > 0 && isWordChar(this.elements[start - 1])) {
            start--;
        }
        let end = offset;
        while (end < this.elements.length && isWordChar(this.elements[end])) {
            end++;
        }
        return ( new OffsetRange(start, end));
    }
    findSubWordContaining(offset) {
        if (offset < 0 || offset >= this.elements.length) {
            return undefined;
        }
        if (!isWordChar(this.elements[offset])) {
            return undefined;
        }
        let start = offset;
        while (start > 0 && isWordChar(this.elements[start - 1]) && !isUpperCase(this.elements[start])) {
            start--;
        }
        let end = offset;
        while (end < this.elements.length && isWordChar(this.elements[end]) && !isUpperCase(this.elements[end])) {
            end++;
        }
        return ( new OffsetRange(start, end));
    }
    countLinesIn(range) {
        return this.translateOffset(range.endExclusive).lineNumber - this.translateOffset(range.start).lineNumber;
    }
    isStronglyEqual(offset1, offset2) {
        return this.elements[offset1] === this.elements[offset2];
    }
    extendToFullLines(range) {
        const start = findLastMonotonous(this.firstElementOffsetByLineIdx, x => x <= range.start) ?? 0;
        const end = findFirstMonotonous(this.firstElementOffsetByLineIdx, x => range.endExclusive <= x) ?? this.elements.length;
        return ( new OffsetRange(start, end));
    }
}
function isWordChar(charCode) {
    return charCode >= CharCode.a && charCode <= CharCode.z || charCode >= CharCode.A && charCode <= CharCode.Z || charCode >= CharCode.Digit0 && charCode <= CharCode.Digit9;
}
function isUpperCase(charCode) {
    return charCode >= CharCode.A && charCode <= CharCode.Z;
}
var CharBoundaryCategory;
(function(CharBoundaryCategory) {
    CharBoundaryCategory[CharBoundaryCategory["WordLower"] = 0] = "WordLower";
    CharBoundaryCategory[CharBoundaryCategory["WordUpper"] = 1] = "WordUpper";
    CharBoundaryCategory[CharBoundaryCategory["WordNumber"] = 2] = "WordNumber";
    CharBoundaryCategory[CharBoundaryCategory["End"] = 3] = "End";
    CharBoundaryCategory[CharBoundaryCategory["Other"] = 4] = "Other";
    CharBoundaryCategory[CharBoundaryCategory["Separator"] = 5] = "Separator";
    CharBoundaryCategory[CharBoundaryCategory["Space"] = 6] = "Space";
    CharBoundaryCategory[CharBoundaryCategory["LineBreakCR"] = 7] = "LineBreakCR";
    CharBoundaryCategory[CharBoundaryCategory["LineBreakLF"] = 8] = "LineBreakLF";
})(CharBoundaryCategory || (CharBoundaryCategory = {}));
const score = {
    [CharBoundaryCategory.WordLower]: 0,
    [CharBoundaryCategory.WordUpper]: 0,
    [CharBoundaryCategory.WordNumber]: 0,
    [CharBoundaryCategory.End]: 10,
    [CharBoundaryCategory.Other]: 2,
    [CharBoundaryCategory.Separator]: 30,
    [CharBoundaryCategory.Space]: 3,
    [CharBoundaryCategory.LineBreakCR]: 10,
    [CharBoundaryCategory.LineBreakLF]: 10
};
function getCategoryBoundaryScore(category) {
    return score[category];
}
function getCategory(charCode) {
    if (charCode === CharCode.LineFeed) {
        return CharBoundaryCategory.LineBreakLF;
    } else if (charCode === CharCode.CarriageReturn) {
        return CharBoundaryCategory.LineBreakCR;
    } else if (isSpace(charCode)) {
        return CharBoundaryCategory.Space;
    } else if (charCode >= CharCode.a && charCode <= CharCode.z) {
        return CharBoundaryCategory.WordLower;
    } else if (charCode >= CharCode.A && charCode <= CharCode.Z) {
        return CharBoundaryCategory.WordUpper;
    } else if (charCode >= CharCode.Digit0 && charCode <= CharCode.Digit9) {
        return CharBoundaryCategory.WordNumber;
    } else if (charCode === -1) {
        return CharBoundaryCategory.End;
    } else if (charCode === CharCode.Comma || charCode === CharCode.Semicolon) {
        return CharBoundaryCategory.Separator;
    } else {
        return CharBoundaryCategory.Other;
    }
}

export { LinesSliceCharSequence };
