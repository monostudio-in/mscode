
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isEqual } from '../../../../base/common/resources.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { IMarkerService } from '../../../../platform/markers/common/markers.service.js';

let MarkerSelectionStatus = class MarkerSelectionStatus extends Disposable {
    static {
        this.ID = "editor.contrib.markerSelectionStatus";
    }
    constructor(_editor, contextKeyService, _markerService) {
        super();
        this._editor = _editor;
        this._markerService = _markerService;
        this._ctxHasDiagnostics = EditorContextKeys.selectionHasDiagnostics.bindTo(contextKeyService);
        this._store.add(this._editor.onDidChangeCursorSelection(() => this._update()));
        this._store.add(this._editor.onDidChangeModel(() => this._update()));
        this._store.add(this._markerService.onMarkerChanged(e => {
            const model = this._editor.getModel();
            if (model && ( e.some(uri => isEqual(uri, model.uri)))) {
                this._update();
            }
        }));
        this._update();
    }
    dispose() {
        this._ctxHasDiagnostics.reset();
        super.dispose();
    }
    _update() {
        const model = this._editor.getModel();
        const selection = this._editor.getSelection();
        if (!model || !selection) {
            this._ctxHasDiagnostics.reset();
            return;
        }
        const markers = this._markerService.read({
            resource: model.uri,
            severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
        });
        const hasIntersecting = ( markers.some(marker => Range.areIntersecting({
            startLineNumber: marker.startLineNumber,
            startColumn: marker.startColumn,
            endLineNumber: marker.endLineNumber,
            endColumn: marker.endColumn
        }, selection)));
        this._ctxHasDiagnostics.set(hasIntersecting);
    }
};
MarkerSelectionStatus = ( __decorate([( __param(1, IContextKeyService)), ( __param(2, IMarkerService))], MarkerSelectionStatus));
registerEditorContribution(
    MarkerSelectionStatus.ID,
    MarkerSelectionStatus,
    EditorContributionInstantiation.AfterFirstRender
);
