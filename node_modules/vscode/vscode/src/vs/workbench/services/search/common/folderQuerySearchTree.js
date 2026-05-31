
import { TernarySearchTree, UriIterator } from '../../../../base/common/ternarySearchTree.js';
import { ResourceMap } from '../../../../base/common/map.js';

class FolderQuerySearchTree extends TernarySearchTree {
    constructor(folderQueries, getFolderQueryInfo, ignorePathCasing = () => false) {
        const uriIterator = ( new UriIterator(ignorePathCasing, () => false));
        super(uriIterator);
        const fqBySameBase = ( new ResourceMap());
        folderQueries.forEach((fq, i) => {
            const uriWithoutQueryOrFragment = fq.folder.with({
                query: "",
                fragment: ""
            });
            if (( fqBySameBase.has(uriWithoutQueryOrFragment))) {
                fqBySameBase.get(uriWithoutQueryOrFragment).push({
                    fq,
                    i
                });
            } else {
                fqBySameBase.set(uriWithoutQueryOrFragment, [{
                    fq,
                    i
                }]);
            }
        });
        fqBySameBase.forEach((values, key) => {
            const folderQueriesWithQueries = ( new Map());
            for (const fqBases of values) {
                const folderQueryInfo = getFolderQueryInfo(fqBases.fq, fqBases.i);
                folderQueriesWithQueries.set(this.encodeKey(fqBases.fq.folder), folderQueryInfo);
            }
            super.set(key, folderQueriesWithQueries);
        });
    }
    findQueryFragmentAwareSubstr(key) {
        const baseURIResult = super.findSubstr(key.with({
            query: "",
            fragment: ""
        }));
        if (!baseURIResult) {
            return undefined;
        }
        const queryAndFragmentKey = this.encodeKey(key);
        return baseURIResult.get(queryAndFragmentKey);
    }
    forEachFolderQueryInfo(fn) {
        return this.forEach(elem => elem.forEach(mapElem => fn(mapElem)));
    }
    encodeKey(key) {
        let str = "";
        if (key.query) {
            str += key.query;
        }
        if (key.fragment) {
            str += "#" + key.fragment;
        }
        return str;
    }
}

export { FolderQuerySearchTree };
