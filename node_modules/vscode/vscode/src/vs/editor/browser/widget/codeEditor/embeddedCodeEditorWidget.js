
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { mixin } from '../../../../base/common/objects.js';
import { ICodeEditorService } from '../../services/codeEditorService.service.js';
import { CodeEditorWidget } from './codeEditorWidget.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.service.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.service.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.service.js';
import { ICommandService } from '../../../../platform/commands/common/commands.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.service.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { IUserInteractionService } from '../../../../platform/userInteraction/browser/userInteractionService.service.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';

let EmbeddedCodeEditorWidget = class EmbeddedCodeEditorWidget extends CodeEditorWidget {
    constructor(
        domElement,
        options,
        codeEditorWidgetOptions,
        parentEditor,
        instantiationService,
        codeEditorService,
        commandService,
        contextKeyService,
        themeService,
        notificationService,
        accessibilityService,
        languageConfigurationService,
        languageFeaturesService,
        userInteractionService,
        keybindingService
    ) {
        super(domElement, {
            ...parentEditor.getRawOptions(),
            overflowWidgetsDomNode: parentEditor.getOverflowWidgetsDomNode()
        }, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService, keybindingService);
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
EmbeddedCodeEditorWidget = ( __decorate([( __param(4, IInstantiationService)), ( __param(5, ICodeEditorService)), ( __param(6, ICommandService)), ( __param(7, IContextKeyService)), ( __param(8, IThemeService)), ( __param(9, INotificationService)), ( __param(10, IAccessibilityService)), ( __param(11, ILanguageConfigurationService)), ( __param(12, ILanguageFeaturesService)), ( __param(13, IUserInteractionService)), ( __param(14, IKeybindingService))], EmbeddedCodeEditorWidget));
function getOuterEditor(accessor) {
    const editor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (editor instanceof EmbeddedCodeEditorWidget) {
        return editor.getParentEditor();
    }
    return editor;
}

export { EmbeddedCodeEditorWidget, getOuterEditor };
