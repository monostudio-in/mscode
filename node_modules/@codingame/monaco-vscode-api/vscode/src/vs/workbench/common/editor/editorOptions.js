
import { TextEditorSelectionSource, TextEditorSelectionRevealType } from '../../../platform/editor/common/editor.js';
import { isTextEditorViewState } from '../editor.js';

function applyTextEditorOptions(options, editor, scrollType) {
    let applied = false;
    const viewState = massageEditorViewState(options);
    if (isTextEditorViewState(viewState)) {
        editor.restoreViewState(viewState);
        applied = true;
    }
    if (options.selection) {
        const range = {
            startLineNumber: options.selection.startLineNumber,
            startColumn: options.selection.startColumn,
            endLineNumber: options.selection.endLineNumber ?? options.selection.startLineNumber,
            endColumn: options.selection.endColumn ?? options.selection.startColumn
        };
        editor.setSelection(range, options.selectionSource ?? TextEditorSelectionSource.NAVIGATION);
        if (options.selectionRevealType === TextEditorSelectionRevealType.NearTop) {
            editor.revealRangeNearTop(range, scrollType);
        }
        else if (options.selectionRevealType === TextEditorSelectionRevealType.NearTopIfOutsideViewport) {
            editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
        }
        else if (options.selectionRevealType === TextEditorSelectionRevealType.CenterIfOutsideViewport) {
            editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
        }
        else {
            editor.revealRangeInCenter(range, scrollType);
        }
        applied = true;
    }
    return applied;
}
function massageEditorViewState(options) {
    if (!options.selection || !options.viewState) {
        return options.viewState;
    }
    const candidateDiffViewState = options.viewState;
    if (candidateDiffViewState.modified) {
        candidateDiffViewState.modified.cursorState = [];
        return candidateDiffViewState;
    }
    const candidateEditorViewState = options.viewState;
    if (candidateEditorViewState.cursorState) {
        candidateEditorViewState.cursorState = [];
    }
    return candidateEditorViewState;
}

export { applyTextEditorOptions };
