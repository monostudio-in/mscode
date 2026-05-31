
import '../../../../../../base/common/observableInternal/index.js';
import { setTimeout0 } from '../../../../../../base/common/platform.js';
import { isSuggestionInViewport } from '../../model/inlineCompletionsModel.js';
import { derived } from '../../../../../../base/common/observableInternal/observables/derived.js';

class ModelPerInlineEdit {
    constructor(_model, inlineEdit, tabAction) {
        this._model = _model;
        this.inlineEdit = inlineEdit;
        this.tabAction = tabAction;
        this.editorType = this._model.editorType;
        this.displayLocation = this.inlineEdit.inlineCompletion.hint;
        this.inViewPort = derived(this, reader => isSuggestionInViewport(this._model.editor, this.inlineEdit.inlineCompletion, reader));
        this.onDidAccept = this._model.onDidAccept;
    }
    accept(alternativeAction) {
        this._model.accept(undefined, alternativeAction);
    }
    handleInlineEditShownNextFrame(viewKind, viewData) {
        const item = this.inlineEdit.inlineCompletion;
        const timeWhenShown = Date.now();
        item.addRef();
        setTimeout0(() => {
            this._model.handleInlineSuggestionShown(item, viewKind, viewData, timeWhenShown);
            item.removeRef();
        });
    }
}

export { ModelPerInlineEdit };
