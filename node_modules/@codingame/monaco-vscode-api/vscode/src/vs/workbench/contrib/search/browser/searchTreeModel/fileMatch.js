
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { Lazy } from '../../../../../base/common/lazy.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { themeColorFromId } from '../../../../../base/common/themables.js';
import { MinimapPosition, TrackedRangeStickiness } from '../../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../../editor/common/services/model.service.js';
import { ILabelService } from '../../../../../platform/label/common/label.service.js';
import '../../../../../platform/theme/common/colorUtils.js';
import '../../../../../platform/theme/common/colors/baseColors.js';
import '../../../../../platform/theme/common/colors/chartsColors.js';
import { overviewRulerFindMatchForeground } from '../../../../../platform/theme/common/colors/editorColors.js';
import '../../../../../platform/theme/common/colors/inputColors.js';
import '../../../../../platform/theme/common/colors/listColors.js';
import '../../../../../platform/theme/common/colors/menuColors.js';
import { minimapFindMatch } from '../../../../../platform/theme/common/colors/minimapColors.js';
import '../../../../../platform/theme/common/colors/miscColors.js';
import '../../../../../platform/theme/common/colors/quickpickColors.js';
import '../../../../../platform/theme/common/colors/searchColors.js';
import { resultIsMatch, DEFAULT_MAX_SEARCH_RESULTS } from '../../../../services/search/common/search.js';
import { editorMatchesToTextSearchResults, getTextSearchMatchWithModelContext } from '../../../../services/search/common/searchHelpers.js';
import { IReplaceService } from '../replace.service.js';
import { FILE_MATCH_PREFIX } from './searchTreeCommon.js';
import { Emitter } from '../../../../../base/common/event.js';
import { textSearchResultToMatches } from './match.js';
import { OverviewRulerLane } from '../../../../../editor/common/standalone/standaloneEnums.js';

var FileMatchImpl_1;
let FileMatchImpl = class FileMatchImpl extends Disposable {
    static {
        FileMatchImpl_1 = this;
    }
    static {
        this._CURRENT_FIND_MATCH = ModelDecorationOptions.register({
            description: "search-current-find-match",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            zIndex: 13,
            className: "currentFindMatch",
            inlineClassName: "currentFindMatchInline",
            overviewRuler: {
                color: themeColorFromId(overviewRulerFindMatchForeground),
                position: OverviewRulerLane.Center
            },
            minimap: {
                color: themeColorFromId(minimapFindMatch),
                position: MinimapPosition.Inline
            }
        });
    }
    static {
        this._FIND_MATCH = ModelDecorationOptions.register({
            description: "search-find-match",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: "findMatch",
            inlineClassName: "findMatchInline",
            overviewRuler: {
                color: themeColorFromId(overviewRulerFindMatchForeground),
                position: OverviewRulerLane.Center
            },
            minimap: {
                color: themeColorFromId(minimapFindMatch),
                position: MinimapPosition.Inline
            }
        });
    }
    static getDecorationOption(selected) {
        return (selected ? FileMatchImpl_1._CURRENT_FIND_MATCH : FileMatchImpl_1._FIND_MATCH);
    }
    get context() {
        return ( new Map(this._context));
    }
    constructor(
        _query,
        _previewOptions,
        _maxResults,
        _parent,
        rawMatch,
        _closestRoot,
        modelService,
        replaceService,
        labelService
    ) {
        super();
        this._query = _query;
        this._previewOptions = _previewOptions;
        this._maxResults = _maxResults;
        this._parent = _parent;
        this.rawMatch = rawMatch;
        this._closestRoot = _closestRoot;
        this.modelService = modelService;
        this.replaceService = replaceService;
        this._onChange = this._register(( new Emitter()));
        this.onChange = this._onChange.event;
        this._onDispose = this._register(( new Emitter()));
        this.onDispose = this._onDispose.event;
        this._model = null;
        this._modelListener = null;
        this._selectedMatch = null;
        this._modelDecorations = [];
        this._context = ( new Map());
        this.replaceQ = Promise.resolve();
        this._resource = this.rawMatch.resource;
        this._textMatches = ( new Map());
        this._removedTextMatches = ( new Set());
        this._updateScheduler = this._register(( new RunOnceScheduler(this.updateMatchesForModel.bind(this), 250)));
        this._name = ( new Lazy(() => labelService.getUriBasenameLabel(this.resource)));
    }
    get closestRoot() {
        return this._closestRoot;
    }
    hasReadonlyMatches() {
        return ( this.matches().some(m => m.isReadonly));
    }
    createMatches() {
        const model = this.modelService.getModel(this._resource);
        if (model) {
            this.bindModel(model);
            this.updateMatchesForModel();
        } else {
            if (this.rawMatch.results) {
                this.rawMatch.results.filter(resultIsMatch).forEach(rawMatch => {
                    textSearchResultToMatches(rawMatch, this, false).forEach(m => this.add(m));
                });
            }
        }
    }
    bindModel(model) {
        this._model = model;
        this._modelListener = ( new DisposableStore());
        this._modelListener.add(this._model.onDidChangeContent(() => {
            this._updateScheduler.schedule();
        }));
        this._modelListener.add(this._model.onWillDispose(() => this.onModelWillDispose()));
        this.updateHighlights();
    }
    onModelWillDispose() {
        this.updateMatchesForModel();
        this.unbindModel();
    }
    unbindModel() {
        if (this._model) {
            this._updateScheduler.cancel();
            this._model.changeDecorations(accessor => {
                this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, []);
            });
            this._model = null;
            this._modelListener.dispose();
        }
    }
    updateMatchesForModel() {
        if (!this._model) {
            return;
        }
        this._textMatches = ( new Map());
        const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
        const matches = this._model.findMatches(
            this._query.pattern,
            this._model.getFullModelRange(),
            !!this._query.isRegExp,
            !!this._query.isCaseSensitive,
            wordSeparators,
            false,
            this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS
        );
        this.updateMatches(matches, true, this._model, false);
    }
    async updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
        if (!this._model) {
            return;
        }
        const range = {
            startLineNumber: lineNumber,
            startColumn: this._model.getLineMinColumn(lineNumber),
            endLineNumber: lineNumber,
            endColumn: this._model.getLineMaxColumn(lineNumber)
        };
        const oldMatches = Array.from(( this._textMatches.values())).filter(match => match.range().startLineNumber === lineNumber);
        oldMatches.forEach(match => this._textMatches.delete(match.id()));
        const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
        const matches = this._model.findMatches(
            this._query.pattern,
            range,
            !!this._query.isRegExp,
            !!this._query.isCaseSensitive,
            wordSeparators,
            false,
            this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS
        );
        this.updateMatches(matches, modelChange, this._model, false);
    }
    updateMatches(matches, modelChange, model, isAiContributed) {
        const textSearchResults = editorMatchesToTextSearchResults(matches, model, this._previewOptions);
        textSearchResults.forEach(textSearchResult => {
            textSearchResultToMatches(textSearchResult, this, isAiContributed).forEach(match => {
                if (!( this._removedTextMatches.has(match.id()))) {
                    this.add(match);
                    if (this.isMatchSelected(match)) {
                        this._selectedMatch = match;
                    }
                }
            });
        });
        this.addContext(
            getTextSearchMatchWithModelContext(textSearchResults, model, this.parent().parent().query)
        );
        this._onChange.fire({
            forceUpdateModel: modelChange
        });
        this.updateHighlights();
    }
    updateHighlights() {
        if (!this._model) {
            return;
        }
        this._model.changeDecorations(accessor => {
            const newDecorations = (this.parent().showHighlights ? ( this.matches().map(match => ({
                range: match.range(),
                options: FileMatchImpl_1.getDecorationOption(this.isMatchSelected(match))
            }))) : []);
            this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, newDecorations);
        });
    }
    id() {
        return FILE_MATCH_PREFIX + ( this.resource.toString());
    }
    parent() {
        return this._parent;
    }
    get hasChildren() {
        return this._textMatches.size > 0;
    }
    matches() {
        return [...( this._textMatches.values())];
    }
    textMatches() {
        return Array.from(( this._textMatches.values()));
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        for (const match of matches) {
            this.removeMatch(match);
            this._removedTextMatches.add(match.id());
        }
        this._onChange.fire({
            didRemove: true
        });
    }
    async replace(toReplace) {
        return this.replaceQ = this.replaceQ.finally(async () => {
            await this.replaceService.replace(toReplace);
            await this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false);
        });
    }
    setSelectedMatch(match) {
        if (match) {
            if (!( this._textMatches.has(match.id()))) {
                return;
            }
            if (this.isMatchSelected(match)) {
                return;
            }
        }
        this._selectedMatch = match;
        this.updateHighlights();
    }
    getSelectedMatch() {
        return this._selectedMatch;
    }
    isMatchSelected(match) {
        return !!this._selectedMatch && this._selectedMatch.id() === match.id();
    }
    count() {
        return this.matches().length;
    }
    get resource() {
        return this._resource;
    }
    name() {
        return this._name.value;
    }
    addContext(results) {
        if (!results) {
            return;
        }
        const contexts = results.filter((result => !resultIsMatch(result)));
        return contexts.forEach(context => this._context.set(context.lineNumber, context.text));
    }
    add(match, trigger) {
        this._textMatches.set(match.id(), match);
        if (trigger) {
            this._onChange.fire({
                forceUpdateModel: true
            });
        }
    }
    removeMatch(match) {
        this._textMatches.delete(match.id());
        if (this.isMatchSelected(match)) {
            this.setSelectedMatch(null);
            this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
        } else {
            this.updateHighlights();
        }
    }
    async resolveFileStat(fileService) {
        this._fileStat = await fileService.stat(this.resource).catch(() => undefined);
    }
    get fileStat() {
        return this._fileStat;
    }
    set fileStat(stat) {
        this._fileStat = stat;
    }
    dispose() {
        this.setSelectedMatch(null);
        this.unbindModel();
        this._onDispose.fire();
        super.dispose();
    }
    hasOnlyReadOnlyMatches() {
        return this.matches().every(match => match.isReadonly);
    }
};
FileMatchImpl = FileMatchImpl_1 = ( __decorate([( __param(6, IModelService)), ( __param(7, IReplaceService)), ( __param(8, ILabelService))], FileMatchImpl));

export { FileMatchImpl };
