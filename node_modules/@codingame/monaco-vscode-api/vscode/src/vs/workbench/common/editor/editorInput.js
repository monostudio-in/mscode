
import { Emitter } from '../../../base/common/event.js';
import { AbstractEditorInput, EditorInputCapabilities, Verbosity, isEditorInput, EditorResourceAccessor } from '../editor.js';
import { isEqual } from '../../../base/common/resources.js';

class EditorInput extends AbstractEditorInput {
    constructor() {
        super(...arguments);
        this._onDidChangeDirty = this._register(( new Emitter()));
        this._onDidChangeLabel = this._register(( new Emitter()));
        this._onDidChangeCapabilities = this._register(( new Emitter()));
        this._onWillDispose = this._register(( new Emitter()));
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this.onDidChangeLabel = this._onDidChangeLabel.event;
        this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
        this.onWillDispose = this._onWillDispose.event;
    }
    get editorId() {
        return undefined;
    }
    get capabilities() {
        return EditorInputCapabilities.Readonly;
    }
    hasCapability(capability) {
        if (capability === EditorInputCapabilities.None) {
            return this.capabilities === EditorInputCapabilities.None;
        }
        return (this.capabilities & capability) !== 0;
    }
    isReadonly() {
        return this.hasCapability(EditorInputCapabilities.Readonly);
    }
    getName() {
        return `Editor ${this.typeId}`;
    }
    getDescription(verbosity) {
        return undefined;
    }
    getTitle(verbosity) {
        return this.getName();
    }
    getLabelExtraClasses() {
        return [];
    }
    getAriaLabel() {
        return this.getTitle(Verbosity.SHORT);
    }
    getIcon() {
        return undefined;
    }
    getTelemetryDescriptor() {
        return {
            typeId: this.typeId
        };
    }
    isDirty() {
        return false;
    }
    isModified() {
        return this.isDirty();
    }
    isSaving() {
        return false;
    }
    async resolve() {
        return null;
    }
    async save(group, options) {
        return this;
    }
    async saveAs(group, options) {
        return this;
    }
    async revert(group, options) {}
    async rename(group, target) {
        return undefined;
    }
    copy() {
        return this;
    }
    canMove(sourceGroup, targetGroup) {
        return true;
    }
    canReopen() {
        return true;
    }
    matches(otherInput) {
        if (isEditorInput(otherInput)) {
            return this === otherInput;
        }
        const otherInputEditorId = otherInput.options?.override;
        if (this.editorId !== otherInputEditorId && otherInputEditorId !== undefined && this.editorId !== undefined) {
            return false;
        }
        return isEqual(this.resource, EditorResourceAccessor.getCanonicalUri(otherInput));
    }
    prefersEditorPane(editorPanes) {
        return editorPanes.at(0);
    }
    toUntyped(options) {
        return undefined;
    }
    isDisposed() {
        return this._store.isDisposed;
    }
    dispose() {
        if (!this.isDisposed()) {
            this._onWillDispose.fire();
        }
        super.dispose();
    }
}

export { EditorInput };
