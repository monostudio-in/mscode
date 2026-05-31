import { ICodeEditor } from "../../editorBrowser.js";
import { ICodeEditorService } from "../../services/codeEditorService.service.js";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "./codeEditorWidget.js";
import { IEditorOptions } from "../../../common/config/editorOptions.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.service.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IUserInteractionService } from "../../../../platform/userInteraction/browser/userInteractionService.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
export declare class EmbeddedCodeEditorWidget extends CodeEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: IEditorOptions, codeEditorWidgetOptions: ICodeEditorWidgetOptions, parentEditor: ICodeEditor, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService, userInteractionService: IUserInteractionService, keybindingService: IKeybindingService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
export declare function getOuterEditor(accessor: ServicesAccessor): ICodeEditor | null;
