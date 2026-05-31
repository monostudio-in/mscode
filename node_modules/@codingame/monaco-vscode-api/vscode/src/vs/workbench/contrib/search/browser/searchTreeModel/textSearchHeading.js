
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { TernarySearchTree } from '../../../../../base/common/ternarySearchTree.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.service.js';
import { IReplaceService } from '../replace.service.js';
import { RangeHighlightDecorations } from './rangeDecorations.js';
import { FolderMatchWorkspaceRootImpl, FolderMatchNoRootImpl } from './folderMatch.js';
import { isSearchTreeFolderMatch, isSearchTreeFileMatch, TEXT_SEARCH_HEADING_PREFIX, PLAIN_TEXT_SEARCH__RESULT_ID } from './searchTreeCommon.js';
import { isNotebookFileMatch } from '../notebookSearch/notebookSearchModelBase.js';

let TextSearchHeadingImpl = class TextSearchHeadingImpl extends Disposable {
    constructor(_allowOtherResults, _parent, instantiationService, uriIdentityService) {
        super();
        this._allowOtherResults = _allowOtherResults;
        this._parent = _parent;
        this.instantiationService = instantiationService;
        this.uriIdentityService = uriIdentityService;
        this._onChange = this._register(( new Emitter()));
        this.onChange = this._onChange.event;
        this._isDirty = false;
        this._showHighlights = false;
        this._query = null;
        this.disposePastResults = () => Promise.resolve();
        this._folderMatches = [];
        this._otherFilesMatch = null;
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
        this.resource = null;
        this.hidden = false;
        this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations);
        this._register(this.onChange(e => {
            if (e.removed) {
                this._isDirty = !this.isEmpty();
            }
        }));
    }
    hide() {
        this.hidden = true;
        this.clear();
    }
    parent() {
        return this._parent;
    }
    get hasChildren() {
        return this._folderMatches.length > 0;
    }
    get isDirty() {
        return this._isDirty;
    }
    getFolderMatch(resource) {
        const folderMatch = this._folderMatchesMap.findSubstr(resource);
        if (!folderMatch && this._allowOtherResults && this._otherFilesMatch) {
            return this._otherFilesMatch;
        }
        return folderMatch;
    }
    add(allRaw, searchInstanceID, silent = false) {
        const {
            byFolder,
            other
        } = this.groupFilesByFolder(allRaw);
        byFolder.forEach(raw => {
            if (!raw.length) {
                return;
            }
            const folderMatch = this.getFolderMatch(raw[0].resource);
            folderMatch?.addFileMatch(raw, silent, searchInstanceID);
        });
        if (!this.isAIContributed) {
            this._otherFilesMatch?.addFileMatch(other, silent, searchInstanceID);
        }
        this.disposePastResults();
    }
    remove(matches, ai = false) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        matches.forEach(m => {
            if (isSearchTreeFolderMatch(m)) {
                m.clear();
            }
        });
        const fileMatches = matches.filter(m => isSearchTreeFileMatch(m));
        const {
            byFolder,
            other
        } = this.groupFilesByFolder(fileMatches);
        byFolder.forEach(matches => {
            if (!matches.length) {
                return;
            }
            this.getFolderMatch(matches[0].resource)?.remove(matches);
        });
        if (other.length) {
            this.getFolderMatch(other[0].resource)?.remove(other);
        }
    }
    groupFilesByFolder(fileMatches) {
        const rawPerFolder = ( new ResourceMap());
        const otherFileMatches = [];
        this._folderMatches.forEach(fm => rawPerFolder.set(fm.resource, []));
        fileMatches.forEach(rawFileMatch => {
            const folderMatch = this.getFolderMatch(rawFileMatch.resource);
            if (!folderMatch) {
                return;
            }
            const resource = folderMatch.resource;
            if (resource) {
                rawPerFolder.get(resource).push(rawFileMatch);
            } else {
                otherFileMatches.push(rawFileMatch);
            }
        });
        return {
            byFolder: rawPerFolder,
            other: otherFileMatches
        };
    }
    isEmpty() {
        return this.folderMatches().every(folderMatch => folderMatch.isEmpty());
    }
    findFolderSubstr(resource) {
        return this._folderMatchesMap.findSubstr(resource);
    }
    clearQuery() {
        const oldFolderMatches = this.folderMatches();
        this.disposePastResults = async () => {
            oldFolderMatches.forEach(match => match.clear());
            oldFolderMatches.forEach(match => match.dispose());
            this._isDirty = false;
        };
        this.cachedSearchComplete = undefined;
        this._rangeHighlightDecorations.removeHighlightRange();
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
    }
    folderMatches() {
        return this._otherFilesMatch && this._allowOtherResults ? [...this._folderMatches, this._otherFilesMatch] : this._folderMatches;
    }
    disposeMatches() {
        this.folderMatches().forEach(folderMatch => folderMatch.dispose());
        this._folderMatches = [];
        this._folderMatchesMap = TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
        this._rangeHighlightDecorations.removeHighlightRange();
    }
    matches() {
        const matches = [];
        this.folderMatches().forEach(folderMatch => {
            matches.push(folderMatch.allDownstreamFileMatches());
        });
        return [].concat(...matches);
    }
    get showHighlights() {
        return this._showHighlights;
    }
    toggleHighlights(value) {
        if (this._showHighlights === value) {
            return;
        }
        this._showHighlights = value;
        let selectedMatch = null;
        this.matches().forEach(fileMatch => {
            fileMatch.updateHighlights();
            if (isNotebookFileMatch(fileMatch)) {
                fileMatch.updateNotebookHighlights();
            }
            if (!selectedMatch) {
                selectedMatch = fileMatch.getSelectedMatch();
            }
        });
        if (this._showHighlights && selectedMatch) {
            this._rangeHighlightDecorations.highlightRange(selectedMatch.parent().resource, selectedMatch.range());
        } else {
            this._rangeHighlightDecorations.removeHighlightRange();
        }
    }
    get rangeHighlightDecorations() {
        return this._rangeHighlightDecorations;
    }
    fileCount() {
        return this.folderMatches().reduce((prev, match) => prev + match.recursiveFileCount(), 0);
    }
    count() {
        return this.matches().reduce((prev, match) => prev + match.count(), 0);
    }
    clear(clearAll = true) {
        this.cachedSearchComplete = undefined;
        this.folderMatches().forEach(folderMatch => folderMatch.clear(clearAll));
        this.disposeMatches();
        this._folderMatches = [];
        this._otherFilesMatch = null;
    }
    async dispose() {
        this._rangeHighlightDecorations.dispose();
        this.disposeMatches();
        super.dispose();
        await this.disposePastResults();
    }
};
TextSearchHeadingImpl = ( __decorate([( __param(2, IInstantiationService)), ( __param(3, IUriIdentityService))], TextSearchHeadingImpl));
let PlainTextSearchHeadingImpl = class PlainTextSearchHeadingImpl extends TextSearchHeadingImpl {
    constructor(parent, instantiationService, uriIdentityService, replaceService) {
        super(true, parent, instantiationService, uriIdentityService);
        this.replaceService = replaceService;
    }
    id() {
        return TEXT_SEARCH_HEADING_PREFIX + PLAIN_TEXT_SEARCH__RESULT_ID;
    }
    get isAIContributed() {
        return false;
    }
    replace(match) {
        return this.getFolderMatch(match.resource)?.replace(match) ?? Promise.resolve();
    }
    name() {
        return "Text";
    }
    replaceAll(progress) {
        this.replacingAll = true;
        const promise = this.replaceService.replace(this.matches(), progress);
        return promise.then(() => {
            this.replacingAll = false;
            this.clear();
        }, () => {
            this.replacingAll = false;
        });
    }
    set replacingAll(running) {
        this.folderMatches().forEach(folderMatch => {
            folderMatch.replacingAll = running;
        });
    }
    get query() {
        return this._query;
    }
    set query(query) {
        this.clearQuery();
        if (!query) {
            return;
        }
        this._folderMatches = ( ( (query && query.folderQueries || []).map(fq => fq.folder)).map((resource, index) => this._createBaseFolderMatch(resource, ( resource.toString()), index, query)));
        this._folderMatches.forEach(fm => this._folderMatchesMap.set(fm.resource, fm));
        this._otherFilesMatch = this._createBaseFolderMatch(null, "otherFiles", this._folderMatches.length + 1, query);
        this._query = query;
    }
    _createBaseFolderMatch(resource, id, index, query) {
        let folderMatch;
        if (resource) {
            folderMatch = this._register(this.createWorkspaceRootWithResourceImpl(resource, id, index, query));
        } else {
            folderMatch = this._register(this.createNoRootWorkspaceImpl(id, index, query));
        }
        const disposable = folderMatch.onChange(event => this._onChange.fire(event));
        this._register(folderMatch.onDispose(() => disposable.dispose()));
        return folderMatch;
    }
    createWorkspaceRootWithResourceImpl(resource, id, index, query) {
        return this.instantiationService.createInstance(FolderMatchWorkspaceRootImpl, resource, id, index, query, this);
    }
    createNoRootWorkspaceImpl(id, index, query) {
        return this._register(
            this.instantiationService.createInstance(FolderMatchNoRootImpl, id, index, query, this)
        );
    }
};
PlainTextSearchHeadingImpl = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, IUriIdentityService)), ( __param(3, IReplaceService))], PlainTextSearchHeadingImpl));

export { PlainTextSearchHeadingImpl, TextSearchHeadingImpl };
