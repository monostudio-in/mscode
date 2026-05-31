
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { MultiEditorTabsControl } from './multiEditorTabsControl.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { StickyEditorGroupModel, UnstickyEditorGroupModel } from '../../../common/editor/filteredEditorGroupModel.js';

let MultiRowEditorControl = class MultiRowEditorControl extends Disposable {
    constructor(
        parent,
        editorPartsView,
        groupsView,
        groupView,
        model,
        instantiationService
    ) {
        super();
        this.parent = parent;
        this.groupsView = groupsView;
        this.groupView = groupView;
        this.model = model;
        this.instantiationService = instantiationService;
        const stickyModel = this._register(( new StickyEditorGroupModel(this.model)));
        const unstickyModel = this._register(( new UnstickyEditorGroupModel(this.model)));
        this.stickyEditorTabsControl = this._register(this.instantiationService.createInstance(
            MultiEditorTabsControl,
            this.parent,
            editorPartsView,
            this.groupsView,
            this.groupView,
            stickyModel
        ));
        this.unstickyEditorTabsControl = this._register(this.instantiationService.createInstance(
            MultiEditorTabsControl,
            this.parent,
            editorPartsView,
            this.groupsView,
            this.groupView,
            unstickyModel
        ));
        this.handleTabBarsStateChange();
    }
    handleTabBarsStateChange() {
        this.activeControl = this.model.activeEditor ? this.getEditorTabsController(this.model.activeEditor) : undefined;
        this.handleTabBarsLayoutChange();
    }
    handleTabBarsLayoutChange() {
        if (this.groupView.count === 0) {
            return;
        }
        const hadTwoTabBars = this.parent.classList.contains("two-tab-bars");
        const hasTwoTabBars = this.groupView.count !== this.groupView.stickyCount && this.groupView.stickyCount > 0;
        this.parent.classList.toggle("two-tab-bars", hasTwoTabBars);
        if (hadTwoTabBars !== hasTwoTabBars) {
            this.groupView.relayout();
        }
    }
    didActiveControlChange() {
        return this.activeControl !== (this.model.activeEditor ? this.getEditorTabsController(this.model.activeEditor) : undefined);
    }
    getEditorTabsController(editor) {
        return this.model.isSticky(editor) ? this.stickyEditorTabsControl : this.unstickyEditorTabsControl;
    }
    openEditor(editor, options) {
        const didActiveControlChange = this.didActiveControlChange();
        const didOpenEditorChange = this.getEditorTabsController(editor).openEditor(editor, options);
        const didChange = didOpenEditorChange || didActiveControlChange;
        if (didChange) {
            this.handleOpenedEditors();
        }
        return didChange;
    }
    openEditors(editors) {
        const stickyEditors = editors.filter(e => this.model.isSticky(e));
        const unstickyEditors = editors.filter(e => !this.model.isSticky(e));
        const didActiveControlChange = this.didActiveControlChange();
        const didChangeOpenEditorsSticky = this.stickyEditorTabsControl.openEditors(stickyEditors);
        const didChangeOpenEditorsUnSticky = this.unstickyEditorTabsControl.openEditors(unstickyEditors);
        const didChange = didChangeOpenEditorsSticky || didChangeOpenEditorsUnSticky || didActiveControlChange;
        if (didChange) {
            this.handleOpenedEditors();
        }
        return didChange;
    }
    handleOpenedEditors() {
        this.handleTabBarsStateChange();
    }
    beforeCloseEditor(editor) {
        this.getEditorTabsController(editor).beforeCloseEditor(editor);
    }
    closeEditor(editor) {
        this.stickyEditorTabsControl.closeEditor(editor);
        this.unstickyEditorTabsControl.closeEditor(editor);
        this.handleClosedEditors();
    }
    closeEditors(editors) {
        const stickyEditors = editors.filter(e => this.model.isSticky(e));
        const unstickyEditors = editors.filter(e => !this.model.isSticky(e));
        this.stickyEditorTabsControl.closeEditors(stickyEditors);
        this.unstickyEditorTabsControl.closeEditors(unstickyEditors);
        this.handleClosedEditors();
    }
    handleClosedEditors() {
        this.handleTabBarsStateChange();
    }
    moveEditor(editor, fromIndex, targetIndex, stickyStateChange) {
        if (stickyStateChange) {
            if (this.model.isSticky(editor)) {
                this.stickyEditorTabsControl.openEditor(editor);
                this.unstickyEditorTabsControl.closeEditor(editor);
            } else {
                this.stickyEditorTabsControl.closeEditor(editor);
                this.unstickyEditorTabsControl.openEditor(editor);
            }
            this.handleTabBarsStateChange();
        } else {
            if (this.model.isSticky(editor)) {
                this.stickyEditorTabsControl.moveEditor(editor, fromIndex, targetIndex, stickyStateChange);
            } else {
                this.unstickyEditorTabsControl.moveEditor(
                    editor,
                    fromIndex - this.model.stickyCount,
                    targetIndex - this.model.stickyCount,
                    stickyStateChange
                );
            }
        }
    }
    pinEditor(editor) {
        this.getEditorTabsController(editor).pinEditor(editor);
    }
    stickEditor(editor) {
        this.unstickyEditorTabsControl.closeEditor(editor);
        this.stickyEditorTabsControl.openEditor(editor);
        this.handleTabBarsStateChange();
    }
    unstickEditor(editor) {
        this.stickyEditorTabsControl.closeEditor(editor);
        this.unstickyEditorTabsControl.openEditor(editor);
        this.handleTabBarsStateChange();
    }
    setActive(isActive) {
        this.stickyEditorTabsControl.setActive(isActive);
        this.unstickyEditorTabsControl.setActive(isActive);
    }
    updateEditorSelections() {
        this.stickyEditorTabsControl.updateEditorSelections();
        this.unstickyEditorTabsControl.updateEditorSelections();
    }
    updateEditorLabel(editor) {
        this.getEditorTabsController(editor).updateEditorLabel(editor);
    }
    updateEditorDirty(editor) {
        this.getEditorTabsController(editor).updateEditorDirty(editor);
    }
    updateOptions(oldOptions, newOptions) {
        this.stickyEditorTabsControl.updateOptions(oldOptions, newOptions);
        this.unstickyEditorTabsControl.updateOptions(oldOptions, newOptions);
    }
    layout(dimensions) {
        const stickyDimensions = this.stickyEditorTabsControl.layout(dimensions);
        const unstickyAvailableDimensions = {
            container: dimensions.container,
            available: ( new Dimension(
                dimensions.available.width,
                dimensions.available.height - stickyDimensions.height
            ))
        };
        const unstickyDimensions = this.unstickyEditorTabsControl.layout(unstickyAvailableDimensions);
        return ( new Dimension(
            dimensions.container.width,
            stickyDimensions.height + unstickyDimensions.height
        ));
    }
    getHeight() {
        return this.stickyEditorTabsControl.getHeight() + this.unstickyEditorTabsControl.getHeight();
    }
    dispose() {
        this.parent.classList.toggle("two-tab-bars", false);
        super.dispose();
    }
};
MultiRowEditorControl = ( __decorate([( __param(5, IInstantiationService))], MultiRowEditorControl));

export { MultiRowEditorControl };
