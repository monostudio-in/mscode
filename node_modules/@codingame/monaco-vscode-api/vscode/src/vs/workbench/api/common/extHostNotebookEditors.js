
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../base/common/event.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { NotebookRange, ViewColumn } from './extHostTypeConverters.js';

let ExtHostNotebookEditors = class ExtHostNotebookEditors {
    constructor(_logService, _notebooksAndEditors) {
        this._logService = _logService;
        this._notebooksAndEditors = _notebooksAndEditors;
        this._onDidChangeNotebookEditorSelection = ( new Emitter());
        this._onDidChangeNotebookEditorVisibleRanges = ( new Emitter());
        this.onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
        this.onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
    }
    $acceptEditorPropertiesChanged(id, data) {
        this._logService.debug("ExtHostNotebook#$acceptEditorPropertiesChanged", id, data);
        const editor = this._notebooksAndEditors.getEditorById(id);
        if (data.visibleRanges) {
            editor._acceptVisibleRanges(( data.visibleRanges.ranges.map(NotebookRange.to)));
        }
        if (data.selections) {
            editor._acceptSelections(( data.selections.selections.map(NotebookRange.to)));
        }
        if (data.visibleRanges) {
            this._onDidChangeNotebookEditorVisibleRanges.fire({
                notebookEditor: editor.apiEditor,
                visibleRanges: editor.apiEditor.visibleRanges
            });
        }
        if (data.selections) {
            this._onDidChangeNotebookEditorSelection.fire(( Object.freeze({
                notebookEditor: editor.apiEditor,
                selections: editor.apiEditor.selections
            })));
        }
    }
    $acceptEditorViewColumns(data) {
        for (const id in data) {
            const editor = this._notebooksAndEditors.getEditorById(id);
            editor._acceptViewColumn(ViewColumn.to(data[id]));
        }
    }
};
ExtHostNotebookEditors = ( __decorate([( __param(0, ILogService))], ExtHostNotebookEditors));

export { ExtHostNotebookEditors };
