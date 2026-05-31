
import { EditOperation } from '../core/editOperation.js';
import { Range } from '../core/range.js';
import { StringReplacement, StringEdit } from '../core/edits/stringEdit.js';
import { OffsetRange } from '../core/ranges/offsetRange.js';
import { LengthEdit } from '../core/edits/lengthEdit.js';
import { countEOL } from '../core/misc/eolCounter.js';

function offsetEditToEditOperations(offsetEdit, doc) {
    const edits = [];
    for (const singleEdit of offsetEdit.replacements) {
        const range = Range.fromPositions(
            doc.getPositionAt(singleEdit.replaceRange.start),
            doc.getPositionAt(singleEdit.replaceRange.start + singleEdit.replaceRange.length)
        );
        edits.push(EditOperation.replace(range, singleEdit.newText));
    }
    return edits;
}
function offsetEditFromContentChanges(contentChanges) {
    const editsArr = ( contentChanges.map(c => ( new StringReplacement(OffsetRange.ofStartAndLength(c.rangeOffset, c.rangeLength), c.text))));
    editsArr.reverse();
    const edits = ( new StringEdit(editsArr));
    return edits;
}
function offsetEditFromLineRangeMapping(original, modified, changes) {
    const edits = [];
    for (const c of changes) {
        for (const i of c.innerChanges ?? []) {
            const newText = modified.getValueInRange(i.modifiedRange);
            const startOrig = original.getOffsetAt(i.originalRange.getStartPosition());
            const endExOrig = original.getOffsetAt(i.originalRange.getEndPosition());
            const origRange = ( new OffsetRange(startOrig, endExOrig));
            edits.push(( new StringReplacement(origRange, newText)));
        }
    }
    return ( new StringEdit(edits));
}
function linesLengthEditFromModelContentChange(c) {
    const contentChanges = c.slice().reverse();
    const lengthEdits = ( contentChanges.map(c => LengthEdit.replace((
    new OffsetRange(c.range.startLineNumber - 1, c.range.endLineNumber)), countEOL(c.text)[0] + 1)));
    const lengthEdit = LengthEdit.compose(lengthEdits);
    return lengthEdit;
}

export { linesLengthEditFromModelContentChange, offsetEditFromContentChanges, offsetEditFromLineRangeMapping, offsetEditToEditOperations };
