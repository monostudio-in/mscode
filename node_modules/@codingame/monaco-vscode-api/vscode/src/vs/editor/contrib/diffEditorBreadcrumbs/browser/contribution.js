
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { reverseOrder, compareBy, numberComparator } from '../../../../base/common/arrays.js';
import '../../../../base/common/observableInternal/index.js';
import { HideUnchangedRegionsFeature } from '../../../browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js';
import { DisposableCancellationTokenSource } from '../../../browser/widget/diffEditor/utils.js';
import { LineRange } from '../../../common/core/ranges/lineRange.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.service.js';
import { IOutlineModelService } from '../../documentSymbols/browser/outlineModel.service.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { observableValue } from '../../../../base/common/observableInternal/observables/observableValue.js';
import { observableSignalFromEvent } from '../../../../base/common/observableInternal/observables/observableSignalFromEvent.js';
import { autorunWithStore } from '../../../../base/common/observableInternal/reactions/autorun.js';

let DiffEditorBreadcrumbsSource = class DiffEditorBreadcrumbsSource extends Disposable {
    constructor(_textModel, _languageFeaturesService, _outlineModelService) {
        super();
        this._textModel = _textModel;
        this._languageFeaturesService = _languageFeaturesService;
        this._outlineModelService = _outlineModelService;
        this._currentModel = observableValue(this, undefined);
        const documentSymbolProviderChanged = observableSignalFromEvent(
            "documentSymbolProvider.onDidChange",
            this._languageFeaturesService.documentSymbolProvider.onDidChange
        );
        const textModelChanged = observableSignalFromEvent(
            "_textModel.onDidChangeContent",
            Event.debounce(e => this._textModel.onDidChangeContent(e), () => undefined, 100)
        );
        this._register(autorunWithStore(async (reader, store) => {
            documentSymbolProviderChanged.read(reader);
            textModelChanged.read(reader);
            const src = store.add(( new DisposableCancellationTokenSource()));
            const model = await this._outlineModelService.getOrCreate(this._textModel, src.token);
            if (store.isDisposed) {
                return;
            }
            this._currentModel.set(model, undefined);
        }));
    }
    getBreadcrumbItems(startRange, reader) {
        const m = this._currentModel.read(reader);
        if (!m) {
            return [];
        }
        const symbols = m.asListOfDocumentSymbols().filter(
            s => startRange.contains(s.range.startLineNumber) && !startRange.contains(s.range.endLineNumber)
        );
        symbols.sort(reverseOrder(
            compareBy(s => s.range.endLineNumber - s.range.startLineNumber, numberComparator)
        ));
        return ( symbols.map(s => ({
            name: s.name,
            kind: s.kind,
            startLineNumber: s.range.startLineNumber
        })));
    }
    getAt(lineNumber, reader) {
        const m = this._currentModel.read(reader);
        if (!m) {
            return [];
        }
        const symbols = m.asListOfDocumentSymbols().filter(s => ( new LineRange(s.range.startLineNumber, s.range.endLineNumber)).contains(lineNumber));
        if (symbols.length === 0) {
            return [];
        }
        symbols.sort(reverseOrder(
            compareBy(s => s.range.endLineNumber - s.range.startLineNumber, numberComparator)
        ));
        return ( symbols.map(s => ({
            name: s.name,
            kind: s.kind,
            startLineNumber: s.range.startLineNumber
        })));
    }
};
DiffEditorBreadcrumbsSource = ( __decorate([( __param(1, ILanguageFeaturesService)), ( __param(2, IOutlineModelService))], DiffEditorBreadcrumbsSource));
HideUnchangedRegionsFeature.setBreadcrumbsSourceFactory((textModel, instantiationService) => {
    return instantiationService.createInstance(DiffEditorBreadcrumbsSource, textModel);
});
