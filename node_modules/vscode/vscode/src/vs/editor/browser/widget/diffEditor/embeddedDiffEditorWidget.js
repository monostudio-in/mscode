
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { mixin } from '../../../../base/common/objects.js';
import { ICodeEditorService } from '../../services/codeEditorService.service.js';
import { DiffEditorWidget } from './diffEditorWidget.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.service.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';

let EmbeddedDiffEditorWidget = class EmbeddedDiffEditorWidget extends DiffEditorWidget {
    constructor(
        domElement,
        options,
        codeEditorWidgetOptions,
        parentEditor,
        contextKeyService,
        instantiationService,
        codeEditorService,
        accessibilitySignalService,
        editorProgressService,
        keybindingService
    ) {
        super(
            domElement,
            parentEditor.getRawOptions(),
            codeEditorWidgetOptions,
            contextKeyService,
            instantiationService,
            codeEditorService,
            accessibilitySignalService,
            editorProgressService,
            keybindingService
        );
        this._parentEditor = parentEditor;
        this._overwriteOptions = options;
        super.updateOptions(this._overwriteOptions);
        this._register(
            parentEditor.onDidChangeConfiguration(e => this._onParentConfigurationChanged(e))
        );
    }
    getParentEditor() {
        return this._parentEditor;
    }
    _onParentConfigurationChanged(e) {
        super.updateOptions(this._parentEditor.getRawOptions());
        super.updateOptions(this._overwriteOptions);
    }
    updateOptions(newOptions) {
        mixin(this._overwriteOptions, newOptions, true);
        super.updateOptions(this._overwriteOptions);
    }
};
EmbeddedDiffEditorWidget = ( __decorate([( __param(4, IContextKeyService)), ( __param(5, IInstantiationService)), ( __param(6, ICodeEditorService)), ( __param(7, IAccessibilitySignalService)), ( __param(8, IEditorProgressService)), ( __param(9, IKeybindingService))], EmbeddedDiffEditorWidget));

export { EmbeddedDiffEditorWidget };
