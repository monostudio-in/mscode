
import { isIMatchInNotebook } from './notebookSearch/notebookSearchModelBase.js';
import { comparePaths, compareFileNames, compareFileExtensions } from '../../../../base/common/comparers.js';
import { SearchSortOrder } from '../../../services/search/common/search.js';
import { Range } from '../../../../editor/common/core/range.js';
import { isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch, createParentList } from './searchTreeModel/searchTreeCommon.js';
import { isSearchTreeAIFileMatch } from './AISearch/aiSearchModelBase.js';

let elemAIndex = -1;
let elemBIndex = -1;
function searchMatchComparer(elementA, elementB, sortOrder = SearchSortOrder.Default) {
    if (isSearchTreeFileMatch(elementA) && isSearchTreeFolderMatch(elementB)) {
        return 1;
    }
    if (isSearchTreeFileMatch(elementB) && isSearchTreeFolderMatch(elementA)) {
        return -1;
    }
    if (isSearchTreeFolderMatch(elementA) && isSearchTreeFolderMatch(elementB)) {
        elemAIndex = elementA.index();
        elemBIndex = elementB.index();
        if (elemAIndex !== -1 && elemBIndex !== -1) {
            return elemAIndex - elemBIndex;
        }
        if (isSearchTreeAIFileMatch(elementA) && isSearchTreeAIFileMatch(elementB)) {
            return elementA.rank - elementB.rank;
        }
        switch (sortOrder) {
            case SearchSortOrder.CountDescending:
                return elementB.count() - elementA.count();
            case SearchSortOrder.CountAscending:
                return elementA.count() - elementB.count();
            case SearchSortOrder.Type:
                return compareFileExtensions(elementA.name(), elementB.name());
            case SearchSortOrder.FileNames:
                return compareFileNames(elementA.name(), elementB.name());
            default:
                if (!elementA.resource || !elementB.resource) {
                    return 0;
                }
                return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
        }
    }
    if (isSearchTreeFileMatch(elementA) && isSearchTreeFileMatch(elementB)) {
        switch (sortOrder) {
            case SearchSortOrder.CountDescending:
                return elementB.count() - elementA.count();
            case SearchSortOrder.CountAscending:
                return elementA.count() - elementB.count();
            case SearchSortOrder.Type:
                return compareFileExtensions(elementA.name(), elementB.name());
            case SearchSortOrder.FileNames:
                return compareFileNames(elementA.name(), elementB.name());
            case SearchSortOrder.Modified: {
                const fileStatA = elementA.fileStat;
                const fileStatB = elementB.fileStat;
                if (fileStatA && fileStatB) {
                    return fileStatB.mtime - fileStatA.mtime;
                }
            }
            default:
                return comparePaths(elementA.resource.fsPath, elementB.resource.fsPath) || compareFileNames(elementA.name(), elementB.name());
        }
    }
    if (isIMatchInNotebook(elementA) && isIMatchInNotebook(elementB)) {
        return compareNotebookPos(elementA, elementB);
    }
    if (isSearchTreeMatch(elementA) && isSearchTreeMatch(elementB)) {
        return Range.compareRangesUsingStarts(elementA.range(), elementB.range());
    }
    return 0;
}
function compareNotebookPos(match1, match2) {
    if (match1.cellIndex === match2.cellIndex) {
        if (match1.webviewIndex !== undefined && match2.webviewIndex !== undefined) {
            return match1.webviewIndex - match2.webviewIndex;
        }
        else if (match1.webviewIndex === undefined && match2.webviewIndex === undefined) {
            return Range.compareRangesUsingStarts(match1.range(), match2.range());
        }
        else {
            if (match1.webviewIndex !== undefined) {
                return 1;
            }
            else {
                return -1;
            }
        }
    }
    else if (match1.cellIndex < match2.cellIndex) {
        return -1;
    }
    else {
        return 1;
    }
}
function searchComparer(elementA, elementB, sortOrder = SearchSortOrder.Default) {
    const elemAParents = createParentList(elementA);
    const elemBParents = createParentList(elementB);
    let i = elemAParents.length - 1;
    let j = elemBParents.length - 1;
    while (i >= 0 && j >= 0) {
        if (elemAParents[i].id() !== elemBParents[j].id()) {
            return searchMatchComparer(elemAParents[i], elemBParents[j], sortOrder);
        }
        i--;
        j--;
    }
    const elemAAtEnd = i === 0;
    const elemBAtEnd = j === 0;
    if (elemAAtEnd && !elemBAtEnd) {
        return 1;
    }
    else if (!elemAAtEnd && elemBAtEnd) {
        return -1;
    }
    return 0;
}

export { searchComparer, searchMatchComparer };
