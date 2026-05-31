
import { commonPrefixLength, commonSuffixLength } from '../../../../base/common/strings.js';
import { OffsetRange } from '../ranges/offsetRange.js';
import { StringText } from '../text/abstractText.js';
import { BaseEdit, BaseReplacement } from './edit.js';

class BaseStringEdit extends BaseEdit {
    get TReplacement() {
        throw ( new Error("TReplacement is not defined for BaseStringEdit"));
    }
    static composeOrUndefined(edits) {
        if (edits.length === 0) {
            return undefined;
        }
        let result = edits[0];
        for (let i = 1; i < edits.length; i++) {
            result = result.compose(edits[i]);
        }
        return result;
    }
    static trySwap(e1, e2) {
        const e1Inv = e1.inverseOnSlice((start, endEx) => " ".repeat(endEx - start));
        const e1_ = e2.tryRebase(e1Inv);
        if (!e1_) {
            return undefined;
        }
        const e2_ = e1.tryRebase(e1_);
        if (!e2_) {
            return undefined;
        }
        return {
            e1: e1_,
            e2: e2_
        };
    }
    apply(base) {
        const resultText = [];
        let pos = 0;
        for (const edit of this.replacements) {
            resultText.push(base.substring(pos, edit.replaceRange.start));
            resultText.push(edit.newText);
            pos = edit.replaceRange.endExclusive;
        }
        resultText.push(base.substring(pos));
        return resultText.join("");
    }
    inverseOnSlice(getOriginalSlice) {
        const edits = [];
        let offset = 0;
        for (const e of this.replacements) {
            edits.push(StringReplacement.replace(
                OffsetRange.ofStartAndLength(e.replaceRange.start + offset, e.newText.length),
                getOriginalSlice(e.replaceRange.start, e.replaceRange.endExclusive)
            ));
            offset += e.newText.length - e.replaceRange.length;
        }
        return ( new StringEdit(edits));
    }
    inverse(original) {
        return this.inverseOnSlice((start, endEx) => original.substring(start, endEx));
    }
    rebaseSkipConflicting(base) {
        return this._tryRebase(base, false);
    }
    tryRebase(base) {
        return this._tryRebase(base, true);
    }
    _tryRebase(base, noOverlap) {
        const newEdits = [];
        let baseIdx = 0;
        let ourIdx = 0;
        let offset = 0;
        while (ourIdx < this.replacements.length || baseIdx < base.replacements.length) {
            const baseEdit = base.replacements.at(baseIdx);
            const ourEdit = this.replacements.at(ourIdx);
            if (!ourEdit) {
                break;
            } else if (!baseEdit) {
                const transformedRange = ourEdit.replaceRange.delta(offset);
                newEdits.push(( new StringReplacement(transformedRange, ourEdit.newText)));
                ourIdx++;
            } else if (ourEdit.replaceRange.intersects(baseEdit.replaceRange) || areConcurrentInserts(ourEdit.replaceRange, baseEdit.replaceRange) || isInsertStrictlyInsideRange(ourEdit.replaceRange, baseEdit.replaceRange) || isInsertStrictlyInsideRange(baseEdit.replaceRange, ourEdit.replaceRange)) {
                ourIdx++;
                if (noOverlap) {
                    return undefined;
                }
            } else if (ourEdit.replaceRange.start < baseEdit.replaceRange.start || (ourEdit.replaceRange.isEmpty && ourEdit.replaceRange.start === baseEdit.replaceRange.start)) {
                const transformedRange = ourEdit.replaceRange.delta(offset);
                newEdits.push(( new StringReplacement(transformedRange, ourEdit.newText)));
                ourIdx++;
            } else {
                baseIdx++;
                offset += baseEdit.newText.length - baseEdit.replaceRange.length;
            }
        }
        return ( new StringEdit(newEdits));
    }
    toJson() {
        return ( this.replacements.map(e => e.toJson()));
    }
    isNeutralOn(text) {
        return this.replacements.every(e => e.isNeutralOn(text));
    }
    removeCommonSuffixPrefix(originalText) {
        const edits = [];
        for (const e of this.replacements) {
            const edit = e.removeCommonSuffixPrefix(originalText);
            if (!edit.isEmpty) {
                edits.push(edit);
            }
        }
        return ( new StringEdit(edits));
    }
    normalizeEOL(eol) {
        return ( new StringEdit(( this.replacements.map(edit => edit.normalizeEOL(eol)))));
    }
    normalizeOnSource(source) {
        const result = this.apply(source);
        const edit = StringReplacement.replace(OffsetRange.ofLength(source.length), result);
        const e = edit.removeCommonSuffixAndPrefix(source);
        if (e.isEmpty) {
            return StringEdit.empty;
        }
        return e.toEdit();
    }
    removeCommonSuffixAndPrefix(source) {
        return this._createNew(( this.replacements.map(e => e.removeCommonSuffixAndPrefix(source)))).normalize();
    }
    applyOnText(docContents) {
        return ( new StringText(this.apply(docContents.value)));
    }
    mapData(f) {
        return ( new AnnotatedStringEdit(( this.replacements.map(e => ( new AnnotatedStringReplacement(e.replaceRange, e.newText, f(e)))))));
    }
}
class BaseStringReplacement extends BaseReplacement {
    constructor(range, newText) {
        super(range);
        this.newText = newText;
    }
    getNewLength() {
        return this.newText.length;
    }
    toString() {
        return `${this.replaceRange} -> ${JSON.stringify(this.newText)}`;
    }
    replace(str) {
        return str.substring(0, this.replaceRange.start) + this.newText + str.substring(this.replaceRange.endExclusive);
    }
    isNeutralOn(text) {
        return this.newText === text.substring(this.replaceRange.start, this.replaceRange.endExclusive);
    }
    removeCommonSuffixPrefix(originalText) {
        const oldText = originalText.substring(this.replaceRange.start, this.replaceRange.endExclusive);
        const prefixLen = commonPrefixLength(oldText, this.newText);
        const suffixLen = Math.min(
            oldText.length - prefixLen,
            this.newText.length - prefixLen,
            commonSuffixLength(oldText, this.newText)
        );
        const replaceRange = ( new OffsetRange(
            this.replaceRange.start + prefixLen,
            this.replaceRange.endExclusive - suffixLen
        ));
        const newText = this.newText.substring(prefixLen, this.newText.length - suffixLen);
        return ( new StringReplacement(replaceRange, newText));
    }
    normalizeEOL(eol) {
        const newText = this.newText.replace(/\r\n|\n/g, eol);
        return ( new StringReplacement(this.replaceRange, newText));
    }
    removeCommonSuffixAndPrefix(source) {
        return this.removeCommonSuffix(source).removeCommonPrefix(source);
    }
    removeCommonPrefix(source) {
        const oldText = this.replaceRange.substring(source);
        const prefixLen = commonPrefixLength(oldText, this.newText);
        if (prefixLen === 0) {
            return this;
        }
        return this.slice(this.replaceRange.deltaStart(prefixLen), ( new OffsetRange(prefixLen, this.newText.length)));
    }
    removeCommonSuffix(source) {
        const oldText = this.replaceRange.substring(source);
        const suffixLen = commonSuffixLength(oldText, this.newText);
        if (suffixLen === 0) {
            return this;
        }
        return this.slice(this.replaceRange.deltaEnd(-suffixLen), ( new OffsetRange(0, this.newText.length - suffixLen)));
    }
    toEdit() {
        return ( new StringEdit([this]));
    }
    toJson() {
        return ({
            txt: this.newText,
            pos: this.replaceRange.start,
            len: this.replaceRange.length
        });
    }
}
class StringEdit extends BaseStringEdit {
    static parse(toStringValue) {
        const replacements = [];
        const regex = /\[(\d+),\s*(\d+)\)\s*->\s*"([^"]*)"/g;
        let match;
        while ((match = regex.exec(toStringValue)) !== null) {
            const start = parseInt(match[1], 10);
            const endEx = parseInt(match[2], 10);
            const text = match[3].replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\\\/g, "\\");
            replacements.push(( new StringReplacement(( new OffsetRange(start, endEx)), text)));
        }
        return ( new StringEdit(replacements));
    }
    static {
        this.empty = ( new StringEdit([]));
    }
    static create(replacements) {
        return ( new StringEdit(replacements));
    }
    static single(replacement) {
        return ( new StringEdit([replacement]));
    }
    static replace(range, replacement) {
        return ( new StringEdit([( new StringReplacement(range, replacement))]));
    }
    static insert(offset, replacement) {
        return ( new StringEdit([( new StringReplacement(OffsetRange.emptyAt(offset), replacement))]));
    }
    static delete(range) {
        return ( new StringEdit([( new StringReplacement(range, ""))]));
    }
    static fromJson(data) {
        return ( new StringEdit(( data.map(StringReplacement.fromJson))));
    }
    static compose(edits) {
        if (edits.length === 0) {
            return StringEdit.empty;
        }
        let result = edits[0];
        for (let i = 1; i < edits.length; i++) {
            result = result.compose(edits[i]);
        }
        return result;
    }
    static composeSequentialReplacements(replacements) {
        let edit = StringEdit.empty;
        let curEditReplacements = [];
        for (const r of replacements) {
            const last = curEditReplacements.at(-1);
            if (!last || r.replaceRange.isBefore(last.replaceRange)) {
                curEditReplacements.push(r);
            } else {
                edit = edit.compose(StringEdit.create(curEditReplacements.reverse()));
                curEditReplacements = [r];
            }
        }
        edit = edit.compose(StringEdit.create(curEditReplacements.reverse()));
        return edit;
    }
    constructor(replacements) {
        super(replacements);
    }
    _createNew(replacements) {
        return ( new StringEdit(replacements));
    }
}
class StringReplacement extends BaseStringReplacement {
    static insert(offset, text) {
        return ( new StringReplacement(OffsetRange.emptyAt(offset), text));
    }
    static replace(range, text) {
        return ( new StringReplacement(range, text));
    }
    static delete(range) {
        return ( new StringReplacement(range, ""));
    }
    static fromJson(data) {
        return ( new StringReplacement(OffsetRange.ofStartAndLength(data.pos, data.len), data.txt));
    }
    equals(other) {
        return this.replaceRange.equals(other.replaceRange) && this.newText === other.newText;
    }
    tryJoinTouching(other) {
        return ( new StringReplacement(
            this.replaceRange.joinRightTouching(other.replaceRange),
            this.newText + other.newText
        ));
    }
    slice(range, rangeInReplacement) {
        return ( new StringReplacement(
            range,
            rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText
        ));
    }
}
function applyEditsToRanges(sortedRanges, edit) {
    sortedRanges = sortedRanges.slice();
    const result = [];
    let offset = 0;
    for (const e of edit.replacements) {
        while (true) {
            const r = sortedRanges[0];
            if (!r || r.endExclusive >= e.replaceRange.start) {
                break;
            }
            sortedRanges.shift();
            result.push(r.delta(offset));
        }
        const intersecting = [];
        while (true) {
            const r = sortedRanges[0];
            if (!r || !r.intersectsOrTouches(e.replaceRange)) {
                break;
            }
            sortedRanges.shift();
            intersecting.push(r);
        }
        for (let i = intersecting.length - 1; i >= 0; i--) {
            let r = intersecting[i];
            const overlap = r.intersect(e.replaceRange).length;
            r = r.deltaEnd(-overlap + (i === 0 ? e.newText.length : 0));
            const rangeAheadOfReplaceRange = r.start - e.replaceRange.start;
            if (rangeAheadOfReplaceRange > 0) {
                r = r.delta(-rangeAheadOfReplaceRange);
            }
            if (i !== 0) {
                r = r.delta(e.newText.length);
            }
            r = r.delta(-(e.newText.length - e.replaceRange.length));
            sortedRanges.unshift(r);
        }
        offset += e.newText.length - e.replaceRange.length;
    }
    while (true) {
        const r = sortedRanges[0];
        if (!r) {
            break;
        }
        sortedRanges.shift();
        result.push(r.delta(offset));
    }
    return result;
}
class AnnotatedStringEdit extends BaseStringEdit {
    static {
        this.empty = ( new AnnotatedStringEdit([]));
    }
    static create(replacements) {
        return ( new AnnotatedStringEdit(replacements));
    }
    static single(replacement) {
        return ( new AnnotatedStringEdit([replacement]));
    }
    static replace(range, replacement, data) {
        return ( new AnnotatedStringEdit([( new AnnotatedStringReplacement(range, replacement, data))]));
    }
    static insert(offset, replacement, data) {
        return ( new AnnotatedStringEdit([( new AnnotatedStringReplacement(OffsetRange.emptyAt(offset), replacement, data))]));
    }
    static delete(range, data) {
        return ( new AnnotatedStringEdit([( new AnnotatedStringReplacement(range, "", data))]));
    }
    static compose(edits) {
        if (edits.length === 0) {
            return AnnotatedStringEdit.empty;
        }
        let result = edits[0];
        for (let i = 1; i < edits.length; i++) {
            result = result.compose(edits[i]);
        }
        return result;
    }
    constructor(replacements) {
        super(replacements);
    }
    _createNew(replacements) {
        return ( new AnnotatedStringEdit(replacements));
    }
    toStringEdit(filter) {
        const newReplacements = [];
        for (const r of this.replacements) {
            if (!filter || filter(r)) {
                newReplacements.push(( new StringReplacement(r.replaceRange, r.newText)));
            }
        }
        return ( new StringEdit(newReplacements));
    }
}
class AnnotatedStringReplacement extends BaseStringReplacement {
    static insert(offset, text, data) {
        return ( new AnnotatedStringReplacement(OffsetRange.emptyAt(offset), text, data));
    }
    static replace(range, text, data) {
        return ( new AnnotatedStringReplacement(range, text, data));
    }
    static delete(range, data) {
        return ( new AnnotatedStringReplacement(range, "", data));
    }
    constructor(range, newText, data) {
        super(range, newText);
        this.data = data;
    }
    equals(other) {
        return this.replaceRange.equals(other.replaceRange) && this.newText === other.newText && this.data === other.data;
    }
    tryJoinTouching(other) {
        const joined = this.data.join(other.data);
        if (joined === undefined) {
            return undefined;
        }
        return ( new AnnotatedStringReplacement(
            this.replaceRange.joinRightTouching(other.replaceRange),
            this.newText + other.newText,
            joined
        ));
    }
    slice(range, rangeInReplacement) {
        return ( new AnnotatedStringReplacement(
            range,
            rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText,
            this.data
        ));
    }
}
function areConcurrentInserts(r1, r2) {
    return r1.isEmpty && r2.isEmpty && r1.start === r2.start;
}
function isInsertStrictlyInsideRange(insert, range) {
    return insert.isEmpty && range.start < insert.start && insert.start < range.endExclusive;
}

export { AnnotatedStringEdit, AnnotatedStringReplacement, BaseStringEdit, BaseStringReplacement, StringEdit, StringReplacement, applyEditsToRanges };
