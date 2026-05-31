
import { matchesSubString } from '../../../../../base/common/filters.js';
import { EndOfLinePreference } from '../../../../common/model.js';
import { singleTextRemoveCommonPrefix } from './singleTextEditHelpers.js';

function inlineCompletionIsVisible(singleTextEdit, originalRange, model, cursorPosition) {
    const minimizedReplacement = singleTextRemoveCommonPrefix(singleTextEdit, model);
    const editRange = singleTextEdit.range;
    if (!editRange
        || (originalRange && !originalRange.getStartPosition().equals(editRange.getStartPosition()))
        || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber
        || minimizedReplacement.isEmpty
    ) {
        return false;
    }
    const originalValue = model.getValueInRange(minimizedReplacement.range, EndOfLinePreference.LF);
    const filterText = minimizedReplacement.text;
    const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
    let filterTextBefore = filterText.substring(0, cursorPosIndex);
    let filterTextAfter = filterText.substring(cursorPosIndex);
    let originalValueBefore = originalValue.substring(0, cursorPosIndex);
    let originalValueAfter = originalValue.substring(cursorPosIndex);
    const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
    if (minimizedReplacement.range.startColumn <= originalValueIndent) {
        originalValueBefore = originalValueBefore.trimStart();
        if (originalValueBefore.length === 0) {
            originalValueAfter = originalValueAfter.trimStart();
        }
        filterTextBefore = filterTextBefore.trimStart();
        if (filterTextBefore.length === 0) {
            filterTextAfter = filterTextAfter.trimStart();
        }
    }
    return filterTextBefore.startsWith(originalValueBefore)
        && !!matchesSubString(originalValueAfter, filterTextAfter);
}

export { inlineCompletionIsVisible };
