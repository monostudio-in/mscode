
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Lazy } from '../../../../../base/common/lazy.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../../editor/common/services/model.service.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.service.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.service.js';
import { resultIsMatch } from '../../../../services/search/common/search.js';
import { IReplaceService } from '../replace.service.js';
import { FileMatchImpl } from '../searchTreeModel/fileMatch.js';
import { TEXT_SEARCH_HEADING_PREFIX, AI_TEXT_SEARCH_RESULT_ID, FOLDER_MATCH_PREFIX, getFileMatches, FILE_MATCH_PREFIX } from '../searchTreeModel/searchTreeCommon.js';
import { TextSearchHeadingImpl } from '../searchTreeModel/textSearchHeading.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { textSearchResultToMatches } from '../searchTreeModel/match.js';
import { ResourceSet } from '../../../../../base/common/map.js';

let AITextSearchHeadingImpl = class AITextSearchHeadingImpl extends TextSearchHeadingImpl {
    constructor(parent, instantiationService, uriIdentityService) {
        super(false, parent, instantiationService, uriIdentityService);
        this.hidden = true;
    }
    name() {
        return "AI";
    }
    id() {
        return TEXT_SEARCH_HEADING_PREFIX + AI_TEXT_SEARCH_RESULT_ID;
    }
    get isAIContributed() {
        return true;
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
        this._query = query;
    }
    fileCount() {
        const uniqueFileUris = ( new ResourceSet());
        for (const folderMatch of this.folderMatches()) {
            if (folderMatch.isEmpty()) {
                continue;
            }
            for (const fileMatch of folderMatch.allDownstreamFileMatches()) {
                uniqueFileUris.add(fileMatch.resource);
            }
        }
        return uniqueFileUris.size;
    }
    _createBaseFolderMatch(resource, id, index, query) {
        const folderMatch = this._register(this.createWorkspaceRootWithResourceImpl(resource, id, index, query));
        const disposable = folderMatch.onChange(event => this._onChange.fire(event));
        this._register(folderMatch.onDispose(() => disposable.dispose()));
        return folderMatch;
    }
    createWorkspaceRootWithResourceImpl(resource, id, index, query) {
        return this.instantiationService.createInstance(AIFolderMatchWorkspaceRootImpl, resource, id, index, query, this);
    }
};
AITextSearchHeadingImpl = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, IUriIdentityService))], AITextSearchHeadingImpl));
let AIFolderMatchWorkspaceRootImpl = class AIFolderMatchWorkspaceRootImpl extends Disposable {
    constructor(
        _resource,
        _id,
        _index,
        _query,
        _parent,
        instantiationService,
        labelService
    ) {
        super();
        this._resource = _resource;
        this._index = _index;
        this._query = _query;
        this._parent = _parent;
        this.instantiationService = instantiationService;
        this._onChange = this._register(( new Emitter()));
        this.onChange = this._onChange.event;
        this._onDispose = this._register(( new Emitter()));
        this.onDispose = this._onDispose.event;
        this.latestRank = 0;
        this.replacingAll = false;
        this._fileMatches = ( new Map());
        this._id = FOLDER_MATCH_PREFIX + _id;
        this._name = ( new Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : ""));
        this._unDisposedFileMatches = ( new Map());
    }
    get resource() {
        return this._resource;
    }
    id() {
        return this._id;
    }
    index() {
        return this._index;
    }
    name() {
        return this._name.value;
    }
    count() {
        return this._fileMatches.size;
    }
    doAddFile(fileMatch) {
        this._fileMatches.set(fileMatch.id(), fileMatch);
    }
    createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
        const fileMatch = this.instantiationService.createInstance(
            AIFileMatch,
            this._query.contentPattern,
            this._query.previewOptions,
            this._query.maxResults,
            this,
            rawFileMatch,
            this,
            ( rawFileMatch.resource.toString()) + "_" + ( Date.now().toString()),
            this.latestRank++
        );
        fileMatch.createMatches();
        this.doAddFile(fileMatch);
        const disposable = fileMatch.onChange((
            {
                didRemove
            }
        ) => this.onFileChange(fileMatch, didRemove));
        this._register(fileMatch.onDispose(() => disposable.dispose()));
        return fileMatch;
    }
    isAIContributed() {
        return true;
    }
    onFileChange(fileMatch, removed = false) {
        let added = false;
        if (!( this._fileMatches.has(fileMatch.id()))) {
            this.doAddFile(fileMatch);
            added = true;
        }
        if (fileMatch.count() === 0) {
            this.doRemoveFile([fileMatch], false, false);
            added = false;
            removed = true;
        }
        this._onChange.fire({
            elements: [fileMatch],
            added: added,
            removed: removed
        });
    }
    get hasChildren() {
        return this._fileMatches.size > 0;
    }
    parent() {
        return this._parent;
    }
    matches() {
        return [...( this._fileMatches.values())];
    }
    allDownstreamFileMatches() {
        return [...( this._fileMatches.values())];
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        const allMatches = getFileMatches(matches);
        this.doRemoveFile(allMatches);
    }
    addFileMatch(raw, silent, searchInstanceID) {
        const added = [];
        const updated = [];
        raw.forEach(rawFileMatch => {
            const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
            added.push(fileMatch);
        });
        const elements = [...added, ...updated];
        if (!silent && elements.length) {
            this._onChange.fire({
                elements,
                added: !!added.length
            });
        }
    }
    isEmpty() {
        return this.recursiveFileCount() === 0;
    }
    clear(clearingAll) {
        const changed = this.allDownstreamFileMatches();
        if (changed.length > 0) {
            this.disposeMatches();
            this._onChange.fire({
                elements: changed,
                removed: true,
                added: false,
                clearingAll
            });
        }
    }
    get showHighlights() {
        return this._parent.showHighlights;
    }
    get searchModel() {
        return this._searchResult.searchModel;
    }
    get _searchResult() {
        return this._parent.parent();
    }
    get query() {
        return this._query;
    }
    getDownstreamFileMatch(uri) {
        for (const fileMatch of ( this._fileMatches.values())) {
            if (( fileMatch.resource.toString()) === ( uri.toString())) {
                return fileMatch;
            }
        }
        return null;
    }
    replaceAll() {
        throw ( new Error("Cannot replace in AI search"));
    }
    recursiveFileCount() {
        return this._fileMatches.size;
    }
    doRemoveFile(fileMatches, dispose = true, trigger = true, keepReadonly = false) {
        const removed = [];
        for (const match of fileMatches) {
            if (this._fileMatches.get(match.id())) {
                if (keepReadonly && match.hasReadonlyMatches()) {
                    continue;
                }
                this._fileMatches.delete(match.id());
                if (dispose) {
                    match.dispose();
                } else {
                    this._unDisposedFileMatches.set(match.id(), match);
                }
                removed.push(match);
            }
        }
        if (trigger) {
            this._onChange.fire({
                elements: removed,
                removed: true
            });
        }
    }
    replace(match) {
        throw ( new Error("Cannot replace in AI search"));
    }
    bindModel(model) {}
    unbindNotebookEditorWidget(editor, resource) {}
    bindNotebookEditorWidget(editor, resource) {
        return Promise.resolve();
    }
    hasOnlyReadOnlyMatches() {
        return Array.from(( this._fileMatches.values())).every(fm => fm.hasOnlyReadOnlyMatches());
    }
    fileMatchesIterator() {
        return ( this._fileMatches.values());
    }
    folderMatchesIterator() {
        return ( [].values());
    }
    recursiveMatchCount() {
        return this._fileMatches.size;
    }
    disposeMatches() {
        [...( this._fileMatches.values())].forEach(fileMatch => fileMatch.dispose());
        [...( this._unDisposedFileMatches.values())].forEach(fileMatch => fileMatch.dispose());
        this._fileMatches.clear();
    }
    dispose() {
        this.disposeMatches();
        this._onDispose.fire();
        super.dispose();
    }
};
AIFolderMatchWorkspaceRootImpl = ( __decorate([( __param(5, IInstantiationService)), ( __param(6, ILabelService))], AIFolderMatchWorkspaceRootImpl));
let AIFileMatch = class AIFileMatch extends FileMatchImpl {
    constructor(
        _query,
        _previewOptions,
        _maxResults,
        _parent,
        rawMatch,
        _closestRoot,
        _id,
        rank,
        modelService,
        replaceService,
        labelService
    ) {
        super({
            pattern: _query
        }, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, modelService, replaceService, labelService);
        this._id = _id;
        this.rank = rank;
    }
    id() {
        return FILE_MATCH_PREFIX + this._id;
    }
    getFullRange() {
        let earliestStart = undefined;
        let latestEnd = undefined;
        for (const match of this.matches()) {
            const matchStart = match.range().getStartPosition();
            const matchEnd = match.range().getEndPosition();
            if (earliestStart === undefined) {
                earliestStart = matchStart;
            } else if (matchStart.isBefore(earliestStart)) {
                earliestStart = matchStart;
            }
            if (latestEnd === undefined) {
                latestEnd = matchEnd;
            } else if (!matchEnd.isBefore(latestEnd)) {
                latestEnd = matchEnd;
            }
        }
        if (earliestStart === undefined || latestEnd === undefined) {
            return undefined;
        }
        return ( new Range(
            earliestStart.lineNumber,
            earliestStart.column,
            latestEnd.lineNumber,
            latestEnd.column
        ));
    }
    rangeAsString() {
        const range = this.getFullRange();
        if (!range) {
            return undefined;
        }
        return range.startLineNumber + ":" + range.startColumn + "-" + range.endLineNumber + ":" + range.endColumn;
    }
    name() {
        const range = this.rangeAsString();
        return super.name() + range ? " " + range : "";
    }
    createMatches() {
        if (this.rawMatch.results) {
            this.rawMatch.results.filter(resultIsMatch).forEach(rawMatch => {
                textSearchResultToMatches(rawMatch, this, true).forEach(m => this.add(m));
            });
        }
    }
};
AIFileMatch = ( __decorate([( __param(8, IModelService)), ( __param(9, IReplaceService)), ( __param(10, ILabelService))], AIFileMatch));

export { AIFolderMatchWorkspaceRootImpl, AITextSearchHeadingImpl };
