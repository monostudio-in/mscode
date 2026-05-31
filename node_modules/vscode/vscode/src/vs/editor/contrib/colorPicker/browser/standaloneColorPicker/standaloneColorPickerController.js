
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { EditorContextKeys } from '../../../../common/editorContextKeys.js';
import { StandaloneColorPickerWidget } from './standaloneColorPickerWidget.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';

var StandaloneColorPickerController_1;
let StandaloneColorPickerController = class StandaloneColorPickerController extends Disposable {
    static {
        StandaloneColorPickerController_1 = this;
    }
    static {
        this.ID = "editor.contrib.standaloneColorPickerController";
    }
    constructor(_editor, _contextKeyService, _instantiationService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._standaloneColorPickerWidget = null;
        this._standaloneColorPickerVisible = EditorContextKeys.standaloneColorPickerVisible.bindTo(_contextKeyService);
        this._standaloneColorPickerFocused = EditorContextKeys.standaloneColorPickerFocused.bindTo(_contextKeyService);
    }
    showOrFocus() {
        if (!this._editor.hasModel()) {
            return;
        }
        if (!this._standaloneColorPickerVisible.get()) {
            this._standaloneColorPickerWidget = this._instantiationService.createInstance(
                StandaloneColorPickerWidget,
                this._editor,
                this._standaloneColorPickerVisible,
                this._standaloneColorPickerFocused
            );
        } else if (!this._standaloneColorPickerFocused.get()) {
            this._standaloneColorPickerWidget?.focus();
        }
    }
    hide() {
        this._standaloneColorPickerFocused.set(false);
        this._standaloneColorPickerVisible.set(false);
        this._standaloneColorPickerWidget?.hide();
        this._editor.focus();
    }
    insertColor() {
        this._standaloneColorPickerWidget?.updateEditor();
        this.hide();
    }
    static get(editor) {
        return editor.getContribution(StandaloneColorPickerController_1.ID);
    }
};
StandaloneColorPickerController = StandaloneColorPickerController_1 = ( __decorate([( __param(1, IContextKeyService)), ( __param(2, IInstantiationService))], StandaloneColorPickerController));

export { StandaloneColorPickerController };
