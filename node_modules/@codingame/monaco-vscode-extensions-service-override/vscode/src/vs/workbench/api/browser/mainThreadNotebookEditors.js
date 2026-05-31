
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { DisposableStore, dispose } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { equals } from '@codingame/monaco-vscode-api/vscode/vs/base/common/objects';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { EditorActivation } from '@codingame/monaco-vscode-api/vscode/vs/platform/editor/common/editor';
import { getNotebookEditorFromEditorPane } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/services/notebookEditorService.service';
import { editorGroupToColumn, columnToEditorGroup } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupColumn';
import { IEditorGroupsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service';
import { IEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service';
import { ExtHostContext, NotebookEditorRevealType } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

class MainThreadNotebook {
    constructor(editor, disposables) {
        this.editor = editor;
        this.disposables = disposables;
    }
    dispose() {
        this.disposables.dispose();
    }
}
let MainThreadNotebookEditors = class MainThreadNotebookEditors {
    constructor(
        extHostContext,
        _editorService,
        _notebookEditorService,
        _editorGroupService,
        _configurationService
    ) {
        this._editorService = _editorService;
        this._notebookEditorService = _notebookEditorService;
        this._editorGroupService = _editorGroupService;
        this._configurationService = _configurationService;
        this._disposables = ( new DisposableStore());
        this._mainThreadEditors = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostNotebookEditors));
        this._editorService.onDidActiveEditorChange(() => this._updateEditorViewColumns(), this, this._disposables);
        this._editorGroupService.onDidRemoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
        this._editorGroupService.onDidMoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
    }
    dispose() {
        this._disposables.dispose();
        dispose(( this._mainThreadEditors.values()));
    }
    handleEditorsAdded(editors) {
        for (const editor of editors) {
            const editorDisposables = ( new DisposableStore());
            editorDisposables.add(editor.onDidChangeVisibleRanges(() => {
                this._proxy.$acceptEditorPropertiesChanged(editor.getId(), {
                    visibleRanges: {
                        ranges: editor.visibleRanges
                    }
                });
            }));
            editorDisposables.add(editor.onDidChangeSelection(() => {
                this._proxy.$acceptEditorPropertiesChanged(editor.getId(), {
                    selections: {
                        selections: editor.getSelections()
                    }
                });
            }));
            const wrapper = ( new MainThreadNotebook(editor, editorDisposables));
            this._mainThreadEditors.set(editor.getId(), wrapper);
        }
    }
    handleEditorsRemoved(editorIds) {
        for (const id of editorIds) {
            this._mainThreadEditors.get(id)?.dispose();
            this._mainThreadEditors.delete(id);
        }
    }
    _updateEditorViewColumns() {
        const result = Object.create(null);
        for (const editorPane of this._editorService.visibleEditorPanes) {
            const candidate = getNotebookEditorFromEditorPane(editorPane);
            if (candidate && ( this._mainThreadEditors.has(candidate.getId()))) {
                result[candidate.getId()] = editorGroupToColumn(this._editorGroupService, editorPane.group);
            }
        }
        if (!equals(result, this._currentViewColumnInfo)) {
            this._currentViewColumnInfo = result;
            this._proxy.$acceptEditorViewColumns(result);
        }
    }
    async $tryShowNotebookDocument(resource, viewType, options) {
        const editorOptions = {
            cellSelections: options.selections,
            preserveFocus: options.preserveFocus,
            pinned: options.pinned,
            activation: options.preserveFocus ? EditorActivation.RESTORE : undefined,
            label: options.label,
            override: viewType
        };
        const editorPane = await this._editorService.openEditor({
            resource: URI.revive(resource),
            options: editorOptions
        }, columnToEditorGroup(this._editorGroupService, this._configurationService, options.position));
        const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
        if (notebookEditor) {
            return notebookEditor.getId();
        } else {
            throw ( new Error(
                `Notebook Editor creation failure for document ${JSON.stringify(resource)}`
            ));
        }
    }
    async $tryRevealRange(id, range, revealType) {
        const editor = this._notebookEditorService.getNotebookEditor(id);
        if (!editor) {
            return;
        }
        const notebookEditor = editor;
        if (!notebookEditor.hasModel()) {
            return;
        }
        if (range.start >= notebookEditor.getLength()) {
            return;
        }
        const cell = notebookEditor.cellAt(range.start);
        switch (revealType) {
        case NotebookEditorRevealType.Default:
            return notebookEditor.revealCellRangeInView(range);
        case NotebookEditorRevealType.InCenter:
            return notebookEditor.revealInCenter(cell);
        case NotebookEditorRevealType.InCenterIfOutsideViewport:
            return notebookEditor.revealInCenterIfOutsideViewport(cell);
        case NotebookEditorRevealType.AtTop:
            return notebookEditor.revealInViewAtTop(cell);
        }
    }
    $trySetSelections(id, ranges) {
        const editor = this._notebookEditorService.getNotebookEditor(id);
        if (!editor) {
            return;
        }
        editor.setSelections(ranges);
        if (ranges.length) {
            editor.setFocus({
                start: ranges[0].start,
                end: ranges[0].start + 1
            });
        }
    }
};
MainThreadNotebookEditors = ( __decorate([( __param(1, IEditorService)), ( __param(2, INotebookEditorService)), ( __param(3, IEditorGroupsService)), ( __param(4, IConfigurationService))], MainThreadNotebookEditors));

export { MainThreadNotebookEditors };
