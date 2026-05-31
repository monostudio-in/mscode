
import { isSearchTreeFileMatch } from '../searchTreeModel/searchTreeCommon.js';

function isNotebookFileMatch(obj) {
    return obj &&
        typeof obj.bindNotebookEditorWidget === 'function' &&
        typeof obj.updateMatchesForEditorWidget === 'function' &&
        typeof obj.unbindNotebookEditorWidget === 'function' &&
        typeof obj.updateNotebookHighlights === 'function'
        && isSearchTreeFileMatch(obj);
}
function isIMatchInNotebook(obj) {
    return typeof obj === 'object' &&
        obj !== null &&
        typeof obj.parent === 'function' &&
        typeof obj.cellParent === 'object' &&
        typeof obj.isWebviewMatch === 'function' &&
        typeof obj.cellIndex === 'number' &&
        (typeof obj.webviewIndex === 'number' || obj.webviewIndex === undefined) &&
        (typeof obj.cell === 'object' || obj.cell === undefined);
}

export { isIMatchInNotebook, isNotebookFileMatch };
