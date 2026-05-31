import { URI } from "../../../../base/common/uri.js";
import { IFolderQuery } from "./search.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
/**
 * A ternary search tree that supports URI keys and query/fragment-aware substring matching, specifically for file search.
 * This is because the traditional TST does not support query and fragments https://github.com/microsoft/vscode/issues/227836
 */
export declare class FolderQuerySearchTree<FolderQueryInfo extends {
    folder: URI;
}> extends TernarySearchTree<URI, Map<string, FolderQueryInfo>> {
    constructor(folderQueries: IFolderQuery<URI>[], getFolderQueryInfo: (fq: IFolderQuery, i: number) => FolderQueryInfo, ignorePathCasing?: (key: URI) => boolean);
    findQueryFragmentAwareSubstr(key: URI): FolderQueryInfo | undefined;
    forEachFolderQueryInfo(fn: (folderQueryInfo: FolderQueryInfo) => void): void;
    private encodeKey;
}
