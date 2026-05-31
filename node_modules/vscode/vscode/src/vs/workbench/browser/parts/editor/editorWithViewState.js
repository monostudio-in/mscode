
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Event } from '../../../../base/common/event.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { EditorPane } from './editorPane.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.service.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.service.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.service.js';
import { IEditorService } from '../../../services/editor/common/editorService.service.js';
import { MutableDisposable, DisposableMap } from '../../../../base/common/lifecycle.js';

let AbstractEditorWithViewState = class AbstractEditorWithViewState extends EditorPane {
    constructor(
        id,
        group,
        viewStateStorageKey,
        telemetryService,
        instantiationService,
        storageService,
        textResourceConfigurationService,
        themeService,
        editorService,
        editorGroupService
    ) {
        super(id, group, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.groupListener = this._register(( new MutableDisposable()));
        this.viewState = this.getEditorMemento(
            editorGroupService,
            textResourceConfigurationService,
            viewStateStorageKey,
            100
        );
    }
    setEditorVisible(visible) {
        this.groupListener.value = this.group.onWillCloseEditor(e => this.onWillCloseEditor(e));
        super.setEditorVisible(visible);
    }
    onWillCloseEditor(e) {
        const editor = e.editor;
        if (editor === this.input) {
            this.updateEditorViewState(editor);
        }
    }
    clearInput() {
        this.updateEditorViewState(this.input);
        super.clearInput();
    }
    saveState() {
        this.updateEditorViewState(this.input);
        super.saveState();
    }
    updateEditorViewState(input) {
        if (!input || !this.tracksEditorViewState(input)) {
            return;
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return;
        }
        if (!this.tracksDisposedEditorViewState()) {
            if (!this.editorViewStateDisposables) {
                this.editorViewStateDisposables = this._register(( new DisposableMap()));
            }
            if (!( this.editorViewStateDisposables.has(input))) {
                this.editorViewStateDisposables.set(input, Event.once(input.onWillDispose)(() => {
                    this.clearEditorViewState(resource, this.group);
                    this.editorViewStateDisposables?.deleteAndDispose(input);
                }));
            }
        }
        if ((input.isDisposed() && !this.tracksDisposedEditorViewState()) || (!this.shouldRestoreEditorViewState(input) && !this.group.contains(input))) {
            this.clearEditorViewState(resource, this.group);
            this.editorViewStateDisposables?.deleteAndDispose(input);
        }
        else if (!input.isDisposed()) {
            this.saveEditorViewState(resource);
        }
    }
    shouldRestoreEditorViewState(input, context) {
        if (context?.newInGroup) {
            return this.textResourceConfigurationService.getValue(EditorResourceAccessor.getOriginalUri(input, {
                supportSideBySide: SideBySideEditor.PRIMARY
            }), "workbench.editor.restoreViewState") !== false ;
        }
        return true;
    }
    getViewState() {
        const input = this.input;
        if (!input || !this.tracksEditorViewState(input)) {
            return;
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return;
        }
        return this.computeEditorViewState(resource);
    }
    saveEditorViewState(resource) {
        const editorViewState = this.computeEditorViewState(resource);
        if (!editorViewState) {
            return;
        }
        this.viewState.saveEditorState(this.group, resource, editorViewState);
    }
    loadEditorViewState(input, context) {
        if (!input) {
            return undefined;
        }
        if (!this.tracksEditorViewState(input)) {
            return undefined;
        }
        if (!this.shouldRestoreEditorViewState(input, context)) {
            return undefined;
        }
        const resource = this.toEditorViewStateResource(input);
        if (!resource) {
            return;
        }
        return this.viewState.loadEditorState(this.group, resource);
    }
    moveEditorViewState(source, target, comparer) {
        return this.viewState.moveEditorState(source, target, comparer);
    }
    clearEditorViewState(resource, group) {
        this.viewState.clearEditorState(resource, group);
    }
    tracksDisposedEditorViewState() {
        return false;
    }
};
AbstractEditorWithViewState = ( __decorate([( __param(3, ITelemetryService)), ( __param(4, IInstantiationService)), ( __param(5, IStorageService)), ( __param(6, ITextResourceConfigurationService)), ( __param(7, IThemeService)), ( __param(8, IEditorService)), ( __param(9, IEditorGroupsService))], AbstractEditorWithViewState));

export { AbstractEditorWithViewState };
