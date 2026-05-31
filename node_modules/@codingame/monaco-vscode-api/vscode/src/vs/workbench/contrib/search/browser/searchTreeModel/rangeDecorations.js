
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { TrackedRangeStickiness } from '../../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../../editor/common/services/model.service.js';

var RangeHighlightDecorations_1;
let RangeHighlightDecorations = class RangeHighlightDecorations {
    static {
        RangeHighlightDecorations_1 = this;
    }
    constructor(_modelService) {
        this._modelService = _modelService;
        this._decorationId = null;
        this._model = null;
        this._modelDisposables = ( new DisposableStore());
    }
    removeHighlightRange() {
        if (this._model && this._decorationId) {
            const decorationId = this._decorationId;
            this._model.changeDecorations(accessor => {
                accessor.removeDecoration(decorationId);
            });
        }
        this._decorationId = null;
    }
    highlightRange(resource, range, ownerId = 0) {
        let model;
        if (URI.isUri(resource)) {
            model = this._modelService.getModel(resource);
        } else {
            model = resource;
        }
        if (model) {
            this.doHighlightRange(model, range);
        }
    }
    doHighlightRange(model, range) {
        this.removeHighlightRange();
        model.changeDecorations(accessor => {
            this._decorationId = accessor.addDecoration(range, RangeHighlightDecorations_1._RANGE_HIGHLIGHT_DECORATION);
        });
        this.setModel(model);
    }
    setModel(model) {
        if (this._model !== model) {
            this.clearModelListeners();
            this._model = model;
            this._modelDisposables.add(this._model.onDidChangeDecorations(e => {
                this.clearModelListeners();
                this.removeHighlightRange();
                this._model = null;
            }));
            this._modelDisposables.add(this._model.onWillDispose(() => {
                this.clearModelListeners();
                this.removeHighlightRange();
                this._model = null;
            }));
        }
    }
    clearModelListeners() {
        this._modelDisposables.clear();
    }
    dispose() {
        if (this._model) {
            this.removeHighlightRange();
            this._model = null;
        }
        this._modelDisposables.dispose();
    }
    static {
        this._RANGE_HIGHLIGHT_DECORATION = ModelDecorationOptions.register({
            description: "search-range-highlight",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: "rangeHighlight",
            isWholeLine: true
        });
    }
};
RangeHighlightDecorations = RangeHighlightDecorations_1 = ( __decorate([( __param(0, IModelService))], RangeHighlightDecorations));

export { RangeHighlightDecorations };
