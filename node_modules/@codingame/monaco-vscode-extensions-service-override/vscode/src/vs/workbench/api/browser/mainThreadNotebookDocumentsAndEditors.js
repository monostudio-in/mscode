
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { diffSets, diffMaps } from '@codingame/monaco-vscode-api/vscode/vs/base/common/collections';
import { DisposableStore, DisposableMap, combinedDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IInstantiationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { MainThreadNotebookDocuments } from './mainThreadNotebookDocuments.js';
import { NotebookDto } from './mainThreadNotebookDto.js';
import { MainThreadNotebookEditors } from './mainThreadNotebookEditors.js';
import { extHostCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { editorGroupToColumn } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupColumn';
import { getNotebookEditorFromEditorPane } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/services/notebookEditorService.service';
import { INotebookService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookService.service';
import { IEditorGroupsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service';
import { IEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { SerializableObjectWithBuffers } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/proxyIdentifier';

var MainThreadNotebooksAndEditors_1;
class NotebookAndEditorState {
    static delta(before, after) {
        if (!before) {
            return {
                addedDocuments: [...after.documents],
                removedDocuments: [],
                addedEditors: [...( after.textEditors.values())],
                removedEditors: [],
                visibleEditors: ( [...after.visibleEditors].map(editor => editor[0]))
            };
        }
        const documentDelta = diffSets(before.documents, after.documents);
        const editorDelta = diffMaps(before.textEditors, after.textEditors);
        const newActiveEditor = before.activeEditor !== after.activeEditor ? after.activeEditor : undefined;
        const visibleEditorDelta = diffMaps(before.visibleEditors, after.visibleEditors);
        return {
            addedDocuments: documentDelta.added,
            removedDocuments: ( documentDelta.removed.map(e => e.uri)),
            addedEditors: editorDelta.added,
            removedEditors: ( editorDelta.removed.map(removed => removed.getId())),
            newActiveEditor: newActiveEditor,
            visibleEditors: visibleEditorDelta.added.length === 0 && visibleEditorDelta.removed.length === 0 ? undefined : ( [...after.visibleEditors].map(editor => editor[0]))
        };
    }
    constructor(documents, textEditors, activeEditor, visibleEditors) {
        this.documents = documents;
        this.textEditors = textEditors;
        this.activeEditor = activeEditor;
        this.visibleEditors = visibleEditors;
    }
}
let MainThreadNotebooksAndEditors = MainThreadNotebooksAndEditors_1 = class MainThreadNotebooksAndEditors {
    constructor(
        extHostContext,
        instantiationService,
        _notebookService,
        _notebookEditorService,
        _editorService,
        _editorGroupService,
        _logService
    ) {
        this._notebookService = _notebookService;
        this._notebookEditorService = _notebookEditorService;
        this._editorService = _editorService;
        this._editorGroupService = _editorGroupService;
        this._logService = _logService;
        this._disposables = ( new DisposableStore());
        this._editorListeners = ( new DisposableMap());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostNotebook));
        this._mainThreadNotebooks = instantiationService.createInstance(MainThreadNotebookDocuments, extHostContext);
        this._mainThreadEditors = instantiationService.createInstance(MainThreadNotebookEditors, extHostContext);
        extHostContext.set(MainContext.MainThreadNotebookDocuments, this._mainThreadNotebooks);
        extHostContext.set(MainContext.MainThreadNotebookEditors, this._mainThreadEditors);
        this._notebookService.onWillAddNotebookDocument(() => this._updateState(), this, this._disposables);
        this._notebookService.onDidRemoveNotebookDocument(() => this._updateState(), this, this._disposables);
        this._editorService.onDidActiveEditorChange(() => this._updateState(), this, this._disposables);
        this._editorService.onDidVisibleEditorsChange(() => this._updateState(), this, this._disposables);
        this._notebookEditorService.onDidAddNotebookEditor(this._handleEditorAdd, this, this._disposables);
        this._notebookEditorService.onDidRemoveNotebookEditor(this._handleEditorRemove, this, this._disposables);
        this._updateState();
    }
    dispose() {
        this._mainThreadNotebooks.dispose();
        this._mainThreadEditors.dispose();
        this._disposables.dispose();
        this._editorListeners.dispose();
    }
    _handleEditorAdd(editor) {
        this._editorListeners.set(editor.getId(), combinedDisposable(
            editor.onDidChangeModel(() => this._updateState()),
            editor.onDidFocusWidget(() => this._updateState(editor))
        ));
        this._updateState();
    }
    _handleEditorRemove(editor) {
        this._editorListeners.deleteAndDispose(editor.getId());
        this._updateState();
    }
    _updateState(focusedEditor) {
        const editors = ( new Map());
        const visibleEditorsMap = ( new Map());
        for (const editor of this._notebookEditorService.listNotebookEditors()) {
            if (editor.hasModel()) {
                editors.set(editor.getId(), editor);
            }
        }
        const activeNotebookEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        let activeEditor = null;
        if (activeNotebookEditor) {
            activeEditor = activeNotebookEditor.getId();
        } else if (focusedEditor?.textModel) {
            activeEditor = focusedEditor.getId();
        }
        if (activeEditor && !( editors.has(activeEditor))) {
            this._logService.trace(
                "MainThreadNotebooksAndEditors#_updateState: active editor is not in editors list",
                activeEditor,
                ( editors.keys())
            );
            activeEditor = null;
        }
        for (const editorPane of this._editorService.visibleEditorPanes) {
            const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
            if (notebookEditor?.hasModel() && ( editors.has(notebookEditor.getId()))) {
                visibleEditorsMap.set(notebookEditor.getId(), notebookEditor);
            }
        }
        const newState = ( new NotebookAndEditorState(( new Set(this._notebookService.listNotebookDocuments())), editors, activeEditor, visibleEditorsMap));
        this._onDelta(NotebookAndEditorState.delta(this._currentState, newState));
        this._currentState = newState;
    }
    _onDelta(delta) {
        if (MainThreadNotebooksAndEditors_1._isDeltaEmpty(delta)) {
            return;
        }
        const dto = {
            removedDocuments: delta.removedDocuments,
            removedEditors: delta.removedEditors,
            newActiveEditor: delta.newActiveEditor,
            visibleEditors: delta.visibleEditors,
            addedDocuments: ( delta.addedDocuments.map(MainThreadNotebooksAndEditors_1._asModelAddData)),
            addedEditors: ( delta.addedEditors.map(this._asEditorAddData, this))
        };
        this._proxy.$acceptDocumentAndEditorsDelta(( new SerializableObjectWithBuffers(dto)));
        this._mainThreadEditors.handleEditorsRemoved(delta.removedEditors);
        this._mainThreadNotebooks.handleNotebooksRemoved(delta.removedDocuments);
        this._mainThreadNotebooks.handleNotebooksAdded(delta.addedDocuments);
        this._mainThreadEditors.handleEditorsAdded(delta.addedEditors);
    }
    static _isDeltaEmpty(delta) {
        if (delta.addedDocuments !== undefined && delta.addedDocuments.length > 0) {
            return false;
        }
        if (delta.removedDocuments !== undefined && delta.removedDocuments.length > 0) {
            return false;
        }
        if (delta.addedEditors !== undefined && delta.addedEditors.length > 0) {
            return false;
        }
        if (delta.removedEditors !== undefined && delta.removedEditors.length > 0) {
            return false;
        }
        if (delta.visibleEditors !== undefined && delta.visibleEditors.length > 0) {
            return false;
        }
        if (delta.newActiveEditor !== undefined) {
            return false;
        }
        return true;
    }
    static _asModelAddData(e) {
        return {
            viewType: e.viewType,
            uri: e.uri,
            metadata: e.metadata,
            versionId: e.versionId,
            cells: ( e.cells.map(NotebookDto.toNotebookCellDto))
        };
    }
    _asEditorAddData(add) {
        const pane = this._editorService.visibleEditorPanes.find(pane => getNotebookEditorFromEditorPane(pane) === add);
        return {
            id: add.getId(),
            documentUri: add.textModel.uri,
            selections: add.getSelections(),
            visibleRanges: add.visibleRanges,
            viewColumn: pane && editorGroupToColumn(this._editorGroupService, pane.group),
            viewType: add.getViewModel().viewType
        };
    }
};
MainThreadNotebooksAndEditors = MainThreadNotebooksAndEditors_1 = __decorate([extHostCustomer, ( __param(1, IInstantiationService)), ( __param(2, INotebookService)), ( __param(3, INotebookEditorService)), ( __param(4, IEditorService)), ( __param(5, IEditorGroupsService)), ( __param(6, ILogService))], MainThreadNotebooksAndEditors);

export { MainThreadNotebooksAndEditors };
