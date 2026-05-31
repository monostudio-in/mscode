
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { groupBy } from '../../../../base/common/arrays.js';
import { compare } from '../../../../base/common/strings.js';
import { isObject } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { ResourceEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { getNotebookEditorFromEditorPane } from '../../notebook/browser/notebookBrowser.js';
import { CellUri, SelectionStateType } from '../../notebook/common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.service.js';
import { IEditorService } from '../../../services/editor/common/editorService.service.js';

class ResourceNotebookCellEdit extends ResourceEdit {
    static is(candidate) {
        if (candidate instanceof ResourceNotebookCellEdit) {
            return true;
        }
        return URI.isUri(candidate.resource) && isObject(candidate.cellEdit);
    }
    static lift(edit) {
        if (edit instanceof ResourceNotebookCellEdit) {
            return edit;
        }
        return ( new ResourceNotebookCellEdit(edit.resource, edit.cellEdit, edit.notebookVersionId, edit.metadata));
    }
    constructor(resource, cellEdit, notebookVersionId = undefined, metadata) {
        super(metadata);
        this.resource = resource;
        this.cellEdit = cellEdit;
        this.notebookVersionId = notebookVersionId;
    }
}
let BulkCellEdits = class BulkCellEdits {
    constructor(
        _undoRedoGroup,
        undoRedoSource,
        _progress,
        _token,
        _edits,
        _editorService,
        _notebookModelService
    ) {
        this._undoRedoGroup = _undoRedoGroup;
        this._progress = _progress;
        this._token = _token;
        this._edits = _edits;
        this._editorService = _editorService;
        this._notebookModelService = _notebookModelService;
        this._edits = ( this._edits.map(e => {
            if (e.resource.scheme === CellUri.scheme) {
                const uri = CellUri.parse(e.resource)?.notebook;
                if (!uri) {
                    throw ( new Error(`Invalid notebook URI: ${e.resource}`));
                }
                return ( new ResourceNotebookCellEdit(uri, e.cellEdit, e.notebookVersionId, e.metadata));
            } else {
                return e;
            }
        }));
    }
    async apply() {
        const resources = [];
        const editsByNotebook = groupBy(this._edits, (a, b) => compare(( a.resource.toString()), ( b.resource.toString())));
        for (const group of editsByNotebook) {
            if (this._token.isCancellationRequested) {
                break;
            }
            const [first] = group;
            const ref = await this._notebookModelService.resolve(first.resource);
            if (typeof first.notebookVersionId === "number" && ref.object.notebook.versionId !== first.notebookVersionId) {
                ref.dispose();
                throw ( new Error(`Notebook '${first.resource}' has changed in the meantime`));
            }
            const edits = ( group.map(entry => entry.cellEdit));
            const computeUndo = !ref.object.isReadonly();
            const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
            const initialSelectionState = editor?.textModel?.uri.toString() === ( ref.object.notebook.uri.toString()) ? {
                kind: SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            } : undefined;
            ref.object.notebook.applyEdits(
                edits,
                true,
                initialSelectionState,
                () => undefined,
                this._undoRedoGroup,
                computeUndo
            );
            ref.dispose();
            this._progress.report(undefined);
            resources.push(first.resource);
        }
        return resources;
    }
};
BulkCellEdits = ( __decorate([( __param(5, IEditorService)), ( __param(6, INotebookEditorModelResolverService))], BulkCellEdits));

export { BulkCellEdits, ResourceNotebookCellEdit };
