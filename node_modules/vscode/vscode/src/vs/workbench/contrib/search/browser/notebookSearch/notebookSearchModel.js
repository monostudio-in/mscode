
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { coalesce } from '../../../../../base/common/arrays.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { FindMatch } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.service.js';
import { ILabelService } from '../../../../../platform/label/common/label.service.js';
import { resultIsMatch } from '../../../../services/search/common/search.js';
import { getTextSearchMatchWithModelContext } from '../../../../services/search/common/searchHelpers.js';
import { FindMatchDecorationModel } from '../../../notebook/browser/contrib/find/findMatchDecorationModel.js';
import { CellFindMatchModel } from '../../../notebook/browser/contrib/find/findModel.js';
import { INotebookEditorService } from '../../../notebook/browser/services/notebookEditorService.service.js';
import { NotebookCellsChangeType } from '../../../notebook/common/notebookCommon.js';
import { CellSearchModel } from '../../common/cellSearchModel.js';
import { rawCellPrefix, isINotebookFileMatchNoModel } from '../../common/searchNotebookHelpers.js';
import { isINotebookCellMatchWithModel, contentMatchesToTextSearchMatches, webviewMatchesToTextSearchMatches, isINotebookFileMatchWithModel } from './searchNotebookHelpers.js';
import { MATCH_PREFIX } from '../searchTreeModel/searchTreeCommon.js';
import { IReplaceService } from '../replace.service.js';
import { FileMatchImpl } from '../searchTreeModel/fileMatch.js';
import { isIMatchInNotebook } from './notebookSearchModelBase.js';
import { MatchImpl, textSearchResultToMatches } from '../searchTreeModel/match.js';

class MatchInNotebook extends MatchImpl {
    constructor(
        _cellParent,
        _fullPreviewLines,
        _fullPreviewRange,
        _documentRange,
        webviewIndex
    ) {
        super(
            _cellParent.parent,
            _fullPreviewLines,
            _fullPreviewRange,
            _documentRange,
            false
        );
        this._cellParent = _cellParent;
        this._id = MATCH_PREFIX + ( this._parent.resource.toString()) + ">" + this._cellParent.cellIndex + (webviewIndex ? "_" + webviewIndex : "") + "_" + this.notebookMatchTypeString() + this._range + this.getMatchString();
        this._webviewIndex = webviewIndex;
    }
    parent() {
        return this._cellParent.parent;
    }
    get cellParent() {
        return this._cellParent;
    }
    notebookMatchTypeString() {
        return this.isWebviewMatch() ? "webview" : "content";
    }
    isWebviewMatch() {
        return this._webviewIndex !== undefined;
    }
    get isReadonly() {
        return super.isReadonly || (!this._cellParent.hasCellViewModel()) || this.isWebviewMatch();
    }
    get cellIndex() {
        return this._cellParent.cellIndex;
    }
    get webviewIndex() {
        return this._webviewIndex;
    }
    get cell() {
        return this._cellParent.cell;
    }
}
class CellMatch {
    constructor(_parent, _cell, _cellIndex) {
        this._parent = _parent;
        this._cell = _cell;
        this._cellIndex = _cellIndex;
        this._contentMatches = ( new Map());
        this._webviewMatches = ( new Map());
        this._context = ( new Map());
    }
    hasCellViewModel() {
        return !(this._cell instanceof CellSearchModel);
    }
    get context() {
        return ( new Map(this._context));
    }
    matches() {
        return [...( this._contentMatches.values()), ...( this._webviewMatches.values())];
    }
    get contentMatches() {
        return Array.from(( this._contentMatches.values()));
    }
    get webviewMatches() {
        return Array.from(( this._webviewMatches.values()));
    }
    remove(matches) {
        if (!Array.isArray(matches)) {
            matches = [matches];
        }
        for (const match of matches) {
            this._contentMatches.delete(match.id());
            this._webviewMatches.delete(match.id());
        }
    }
    clearAllMatches() {
        this._contentMatches.clear();
        this._webviewMatches.clear();
    }
    addContentMatches(textSearchMatches) {
        const contentMatches = textSearchMatchesToNotebookMatches(textSearchMatches);
        contentMatches.forEach(match => {
            this._contentMatches.set(match.id(), match);
        });
        this.addContext(textSearchMatches);
    }
    addContext(textSearchMatches) {
        if (!this.cell) {
            return;
        }
        this.cell.resolveTextModel().then(textModel => {
            const textResultsWithContext = getTextSearchMatchWithModelContext(textSearchMatches, textModel, this.parent.parent().query);
            const contexts = textResultsWithContext.filter((result => !resultIsMatch(result)));
            ( contexts.map(context => ({
                ...context,
                lineNumber: context.lineNumber + 1
            }))).forEach(context => {
                this._context.set(context.lineNumber, context.text);
            });
        });
    }
    addWebviewMatches(textSearchMatches) {
        const webviewMatches = textSearchMatchesToNotebookMatches(textSearchMatches);
        webviewMatches.forEach(match => {
            this._webviewMatches.set(match.id(), match);
        });
    }
    setCellModel(cell) {
        this._cell = cell;
    }
    get parent() {
        return this._parent;
    }
    get id() {
        return this._cell?.id ?? `${rawCellPrefix}${this.cellIndex}`;
    }
    get cellIndex() {
        return this._cellIndex;
    }
    get cell() {
        return this._cell;
    }
}
let NotebookCompatibleFileMatch = class NotebookCompatibleFileMatch extends FileMatchImpl {
    constructor(
        _query,
        _previewOptions,
        _maxResults,
        _parent,
        rawMatch,
        _closestRoot,
        searchInstanceID,
        modelService,
        replaceService,
        labelService,
        notebookEditorService
    ) {
        super(
            _query,
            _previewOptions,
            _maxResults,
            _parent,
            rawMatch,
            _closestRoot,
            modelService,
            replaceService,
            labelService
        );
        this.searchInstanceID = searchInstanceID;
        this.notebookEditorService = notebookEditorService;
        this._notebookEditorWidget = null;
        this._editorWidgetListener = null;
        this._cellMatches = ( new Map());
        this._notebookUpdateScheduler = this._register(( new RunOnceScheduler(this.updateMatchesForEditorWidget.bind(this), 250)));
    }
    get cellContext() {
        const cellContext = ( new Map());
        this._cellMatches.forEach(cellMatch => {
            cellContext.set(cellMatch.id, cellMatch.context);
        });
        return cellContext;
    }
    getCellMatch(cellID) {
        return this._cellMatches.get(cellID);
    }
    addCellMatch(rawCell) {
        const cellMatch = ( new CellMatch(
            this,
            isINotebookCellMatchWithModel(rawCell) ? rawCell.cell : undefined,
            rawCell.index
        ));
        this._cellMatches.set(cellMatch.id, cellMatch);
        this.addWebviewMatchesToCell(cellMatch.id, rawCell.webviewResults);
        this.addContentMatchesToCell(cellMatch.id, rawCell.contentResults);
    }
    addWebviewMatchesToCell(cellID, webviewMatches) {
        const cellMatch = this.getCellMatch(cellID);
        if (cellMatch !== undefined) {
            cellMatch.addWebviewMatches(webviewMatches);
        }
    }
    addContentMatchesToCell(cellID, contentMatches) {
        const cellMatch = this.getCellMatch(cellID);
        if (cellMatch !== undefined) {
            cellMatch.addContentMatches(contentMatches);
        }
    }
    revealCellRange(match, outputOffset) {
        if (!this._notebookEditorWidget || !match.cell) {
            return;
        }
        if (match.webviewIndex !== undefined) {
            const index = this._notebookEditorWidget.getCellIndex(match.cell);
            if (index !== undefined) {
                this._notebookEditorWidget.revealCellOffsetInCenter(match.cell, outputOffset ?? 0);
            }
        } else {
            match.cell.updateEditState(match.cell.getEditState(), "focusNotebookCell");
            this._notebookEditorWidget.setCellEditorSelection(match.cell, match.range());
            this._notebookEditorWidget.revealRangeInCenterIfOutsideViewportAsync(match.cell, match.range());
        }
    }
    bindNotebookEditorWidget(widget) {
        if (this._notebookEditorWidget === widget) {
            return;
        }
        this._notebookEditorWidget = widget;
        this._editorWidgetListener = this._notebookEditorWidget.textModel?.onDidChangeContent(e => {
            if (!( e.rawEvents.some(
                event => event.kind === NotebookCellsChangeType.ChangeCellContent || event.kind === NotebookCellsChangeType.ModelChange
            ))) {
                return;
            }
            this._notebookUpdateScheduler.schedule();
        }) ?? null;
        this._addNotebookHighlights();
    }
    unbindNotebookEditorWidget(widget) {
        if (widget && this._notebookEditorWidget !== widget) {
            return;
        }
        if (this._notebookEditorWidget) {
            this._notebookUpdateScheduler.cancel();
            this._editorWidgetListener?.dispose();
        }
        this._removeNotebookHighlights();
        this._notebookEditorWidget = null;
    }
    updateNotebookHighlights() {
        if (this.parent().showHighlights) {
            this._addNotebookHighlights();
            this.setNotebookFindMatchDecorationsUsingCellMatches(Array.from(( this._cellMatches.values())));
        } else {
            this._removeNotebookHighlights();
        }
    }
    _addNotebookHighlights() {
        if (!this._notebookEditorWidget) {
            return;
        }
        this._findMatchDecorationModel?.stopWebviewFind();
        this._findMatchDecorationModel?.dispose();
        this._findMatchDecorationModel = ( new FindMatchDecorationModel(this._notebookEditorWidget, this.searchInstanceID));
        if (this._selectedMatch instanceof MatchInNotebook) {
            this.highlightCurrentFindMatchDecoration(this._selectedMatch);
        }
    }
    _removeNotebookHighlights() {
        if (this._findMatchDecorationModel) {
            this._findMatchDecorationModel?.stopWebviewFind();
            this._findMatchDecorationModel?.dispose();
            this._findMatchDecorationModel = undefined;
        }
    }
    updateNotebookMatches(matches, modelChange) {
        if (!this._notebookEditorWidget) {
            return;
        }
        const oldCellMatches = ( new Map(this._cellMatches));
        if (this._notebookEditorWidget.getId() !== this._lastEditorWidgetIdForUpdate) {
            this._cellMatches.clear();
            this._lastEditorWidgetIdForUpdate = this._notebookEditorWidget.getId();
        }
        matches.forEach(match => {
            let existingCell = this._cellMatches.get(match.cell.id);
            if (this._notebookEditorWidget && !existingCell) {
                const index = this._notebookEditorWidget.getCellIndex(match.cell);
                const existingRawCell = oldCellMatches.get(`${rawCellPrefix}${index}`);
                if (existingRawCell) {
                    existingRawCell.setCellModel(match.cell);
                    existingRawCell.clearAllMatches();
                    existingCell = existingRawCell;
                }
            }
            existingCell?.clearAllMatches();
            const cell = existingCell ?? ( new CellMatch(this, match.cell, match.index));
            cell.addContentMatches(contentMatchesToTextSearchMatches(match.contentMatches, match.cell));
            cell.addWebviewMatches(webviewMatchesToTextSearchMatches(match.webviewMatches));
            this._cellMatches.set(cell.id, cell);
        });
        this._findMatchDecorationModel?.setAllFindMatchesDecorations(matches);
        if (this._selectedMatch instanceof MatchInNotebook) {
            this.highlightCurrentFindMatchDecoration(this._selectedMatch);
        }
        this._onChange.fire({
            forceUpdateModel: modelChange
        });
    }
    setNotebookFindMatchDecorationsUsingCellMatches(cells) {
        if (!this._findMatchDecorationModel) {
            return;
        }
        const cellFindMatch = coalesce(( cells.map(cell => {
            const webviewMatches = coalesce(( cell.webviewMatches.map(match => {
                if (!match.webviewIndex) {
                    return undefined;
                }
                return {
                    index: match.webviewIndex
                };
            })));
            if (!cell.cell) {
                return undefined;
            }
            const findMatches = ( cell.contentMatches.map(match => {
                return ( new FindMatch(match.range(), [match.text()]));
            }));
            return ( new CellFindMatchModel(cell.cell, cell.cellIndex, findMatches, webviewMatches));
        })));
        try {
            this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatch);
        } catch (e) {}
    }
    async updateMatchesForEditorWidget() {
        if (!this._notebookEditorWidget) {
            return;
        }
        this._textMatches = ( new Map());
        const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
        const allMatches = await this._notebookEditorWidget.find(this._query.pattern, {
            regex: this._query.isRegExp,
            wholeWord: this._query.isWordMatch,
            caseSensitive: this._query.isCaseSensitive,
            wordSeparators: wordSeparators ?? undefined,
            includeMarkupInput: this._query.notebookInfo?.isInNotebookMarkdownInput,
            includeMarkupPreview: this._query.notebookInfo?.isInNotebookMarkdownPreview,
            includeCodeInput: this._query.notebookInfo?.isInNotebookCellInput,
            includeOutput: this._query.notebookInfo?.isInNotebookCellOutput
        }, CancellationToken.None, false, true, this.searchInstanceID);
        this.updateNotebookMatches(allMatches, true);
    }
    async showMatch(match) {
        const offset = await this.highlightCurrentFindMatchDecoration(match);
        this.setSelectedMatch(match);
        this.revealCellRange(match, offset);
    }
    async highlightCurrentFindMatchDecoration(match) {
        if (!this._findMatchDecorationModel || !match.cell) {
            return null;
        }
        if (match.webviewIndex === undefined) {
            return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(match.cell, match.range());
        } else {
            return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(match.cell, match.webviewIndex);
        }
    }
    matches() {
        const matches = Array.from(( this._cellMatches.values())).flatMap(e => e.matches());
        return [...super.matches(), ...matches];
    }
    removeMatch(match) {
        if (match instanceof MatchInNotebook) {
            match.cellParent.remove(match);
            if (match.cellParent.matches().length === 0) {
                this._cellMatches.delete(match.cellParent.id);
            }
            if (this.isMatchSelected(match)) {
                this.setSelectedMatch(null);
                this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
            } else {
                this.updateHighlights();
            }
            this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
        } else {
            super.removeMatch(match);
        }
    }
    cellMatches() {
        return Array.from(( this._cellMatches.values()));
    }
    createMatches() {
        const model = this.modelService.getModel(this._resource);
        if (model) {
            this.bindModel(model);
            this.updateMatchesForModel();
        } else {
            const notebookEditorWidgetBorrow = this.notebookEditorService.retrieveExistingWidgetFromURI(this.resource);
            if (notebookEditorWidgetBorrow?.value) {
                this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
            }
            if (this.rawMatch.results) {
                this.rawMatch.results.filter(resultIsMatch).forEach(rawMatch => {
                    textSearchResultToMatches(rawMatch, this, false).forEach(m => this.add(m));
                });
            }
            if (isINotebookFileMatchWithModel(this.rawMatch) || isINotebookFileMatchNoModel(this.rawMatch)) {
                this.rawMatch.cellResults?.forEach(cell => this.addCellMatch(cell));
                this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
                this._onChange.fire({
                    forceUpdateModel: true
                });
            }
            this.addContext(this.rawMatch.results);
        }
    }
    get hasChildren() {
        return super.hasChildren || this._cellMatches.size > 0;
    }
    setSelectedMatch(match) {
        if (match) {
            if (!this.isMatchSelected(match) && isIMatchInNotebook(match)) {
                this._selectedMatch = match;
                return;
            }
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
    dispose() {
        this.unbindNotebookEditorWidget();
        super.dispose();
    }
};
NotebookCompatibleFileMatch = ( __decorate([( __param(7, IModelService)), ( __param(8, IReplaceService)), ( __param(9, ILabelService)), ( __param(10, INotebookEditorService))], NotebookCompatibleFileMatch));
function textSearchMatchesToNotebookMatches(textSearchMatches, cell) {
    const notebookMatches = [];
    textSearchMatches.forEach(textSearchMatch => {
        textSearchMatch.previewText.split("\n");
    });
    return notebookMatches;
}

export { CellMatch, MatchInNotebook, NotebookCompatibleFileMatch, textSearchMatchesToNotebookMatches };
