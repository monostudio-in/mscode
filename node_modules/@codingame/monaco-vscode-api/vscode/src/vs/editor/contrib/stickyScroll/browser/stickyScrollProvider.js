
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.service.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { binarySearch } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.service.js';
import { StickyModelProvider } from './stickyScrollModelProvider.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';

class StickyLineCandidate {
    constructor(startLineNumber, endLineNumber, top, height) {
        this.startLineNumber = startLineNumber;
        this.endLineNumber = endLineNumber;
        this.top = top;
        this.height = height;
    }
}
let StickyLineCandidateProvider = class StickyLineCandidateProvider extends Disposable {
    static {
        this.ID = "store.contrib.stickyScrollController";
    }
    constructor(editor, _languageFeaturesService, _languageConfigurationService) {
        super();
        this._languageFeaturesService = _languageFeaturesService;
        this._languageConfigurationService = _languageConfigurationService;
        this._onDidChangeStickyScroll = this._register(( new Emitter()));
        this.onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
        this._model = null;
        this._cts = null;
        this._stickyModelProvider = null;
        this._editor = editor;
        this._sessionStore = this._register(( new DisposableStore()));
        this._updateSoon = this._register(( new RunOnceScheduler(() => this.update(), 50)));
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(EditorOption.stickyScroll)) {
                this.readConfiguration();
            }
        }));
        this.readConfiguration();
    }
    readConfiguration() {
        this._sessionStore.clear();
        const options = this._editor.getOption(EditorOption.stickyScroll);
        if (!options.enabled) {
            return;
        }
        this._sessionStore.add(this._editor.onDidChangeModel(() => {
            this._model = null;
            this.updateStickyModelProvider();
            this._onDidChangeStickyScroll.fire();
            this.update();
        }));
        this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
        this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
        this._sessionStore.add(
            this._languageFeaturesService.documentSymbolProvider.onDidChange(() => this.update())
        );
        this._sessionStore.add(toDisposable(() => {
            this._stickyModelProvider?.dispose();
            this._stickyModelProvider = null;
        }));
        this.updateStickyModelProvider();
        this.update();
    }
    getVersionId() {
        return this._model?.version;
    }
    updateStickyModelProvider() {
        this._stickyModelProvider?.dispose();
        this._stickyModelProvider = null;
        if (this._editor.hasModel()) {
            this._stickyModelProvider = ( new StickyModelProvider(
                this._editor,
                () => this._updateSoon.schedule(),
                this._languageConfigurationService,
                this._languageFeaturesService
            ));
        }
    }
    async update() {
        this._cts?.dispose(true);
        this._cts = ( new CancellationTokenSource());
        await this.updateStickyModel(this._cts.token);
        this._onDidChangeStickyScroll.fire();
    }
    async updateStickyModel(token) {
        if (!this._editor.hasModel() || !this._stickyModelProvider || this._editor.getModel().isTooLargeForTokenization()) {
            this._model = null;
            return;
        }
        const model = await this._stickyModelProvider.update(token);
        if (!token.isCancellationRequested) {
            this._model = model;
        }
    }
    getCandidateStickyLinesIntersecting(range) {
        if (!this._model?.element) {
            return [];
        }
        const stickyLineCandidates = [];
        this.getCandidateStickyLinesIntersectingFromStickyModel(range, this._model.element, stickyLineCandidates, 0, 0, -1);
        return this.filterHiddenRanges(stickyLineCandidates);
    }
    getCandidateStickyLinesIntersectingFromStickyModel(range, outlineModel, result, depth, top, lastStartLineNumber) {
        const textModel = this._editor.getModel();
        if (!textModel) {
            return;
        }
        if (outlineModel.children.length === 0) {
            return;
        }
        let lastLine = lastStartLineNumber;
        const childrenStartLines = [];
        for (let i = 0; i < outlineModel.children.length; i++) {
            const child = outlineModel.children[i];
            if (child.range) {
                childrenStartLines.push(child.range.startLineNumber);
            }
        }
        const lowerBound = this.updateIndex(binarySearch(childrenStartLines, range.startLineNumber, (a, b) => {
            return a - b;
        }));
        const upperBound = this.updateIndex(binarySearch(childrenStartLines, range.endLineNumber, (a, b) => {
            return a - b;
        }));
        for (let i = lowerBound; i <= upperBound; i++) {
            const child = outlineModel.children[i];
            if (!child || !child.range) {
                continue;
            }
            const {
                startLineNumber,
                endLineNumber
            } = child.range;
            if (endLineNumber > startLineNumber + 1 && range.startLineNumber <= endLineNumber + 1 && startLineNumber - 1 <= range.endLineNumber && startLineNumber !== lastLine && textModel.isValidRange(( new Range(startLineNumber, 1, endLineNumber, 1)))) {
                lastLine = startLineNumber;
                const lineHeight = this._editor.getLineHeightForPosition(( new Position(startLineNumber, 1)));
                result.push(( new StickyLineCandidate(startLineNumber, endLineNumber - 1, top, lineHeight)));
                this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth + 1, top + lineHeight, startLineNumber);
            }
        }
    }
    filterHiddenRanges(stickyLineCandidates) {
        const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
        if (!hiddenRanges) {
            return stickyLineCandidates;
        }
        return stickyLineCandidates.filter(candidate => {
            return !( hiddenRanges.some(
                hiddenRange => candidate.startLineNumber >= hiddenRange.startLineNumber && candidate.endLineNumber <= hiddenRange.endLineNumber + 1
            ));
        });
    }
    updateIndex(index) {
        if (index === -1) {
            return 0;
        } else if (index < 0) {
            return -index - 2;
        }
        return index;
    }
};
StickyLineCandidateProvider = ( __decorate([( __param(1, ILanguageFeaturesService)), ( __param(2, ILanguageConfigurationService))], StickyLineCandidateProvider));

export { StickyLineCandidate, StickyLineCandidateProvider };
