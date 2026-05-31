
import { __decorate, __param } from './external/tslib/tslib.es6.js';
import { StandaloneKeybindingService, StandaloneServices } from './vscode/src/vs/editor/standalone/browser/standaloneServices.js';
import { ITextResourceConfigurationService } from './vscode/src/vs/editor/common/services/textResourceConfiguration.service.js';
import { IInstantiationService } from './vscode/src/vs/platform/instantiation/common/instantiation.js';
import { StandaloneCodeEditor, StandaloneEditor, StandaloneDiffEditor2 } from './vscode/src/vs/editor/standalone/browser/standaloneCodeEditor.js';
import { isObject } from './vscode/src/vs/base/common/types.js';
import { deepClone, distinct } from './vscode/src/vs/base/common/objects.js';
import './vscode/src/vs/editor/browser/widget/codeEditor/codeEditorWidget.js';
export { errorHandler, setUnexpectedErrorHandler } from './vscode/src/vs/base/common/errors.js';
export { FoldingModel, setCollapseStateForMatchingLines } from './vscode/src/vs/editor/contrib/folding/browser/foldingModel.js';
export { FoldingController } from './vscode/src/vs/editor/contrib/folding/browser/folding.js';
export { DisposableStore } from './vscode/src/vs/base/common/lifecycle.js';
export { Registry } from './vscode/src/vs/platform/registry/common/platform.js';
import { Extensions as Extensions$2 } from './vscode/src/vs/platform/jsonschemas/common/jsonContributionRegistry.js';
export { CommandsRegistry } from './vscode/src/vs/platform/commands/common/commands.js';
export { MenuId, MenuRegistry } from './vscode/src/vs/platform/actions/common/actions.js';
export { KeybindingsRegistry } from './vscode/src/vs/platform/keybinding/common/keybindingsRegistry.js';
import { Extensions as Extensions$1 } from './vscode/src/vs/platform/configuration/common/configurationRegistry.js';
import { EditorOptionsUtil } from './vscode/src/vs/editor/browser/config/editorConfiguration.js';
export { registerColor } from './vscode/src/vs/platform/theme/common/colorUtils.js';
import './vscode/src/vs/platform/theme/common/colors/baseColors.js';
import './vscode/src/vs/platform/theme/common/colors/chartsColors.js';
import './vscode/src/vs/platform/theme/common/colors/editorColors.js';
import './vscode/src/vs/platform/theme/common/colors/inputColors.js';
import './vscode/src/vs/platform/theme/common/colors/listColors.js';
import './vscode/src/vs/platform/theme/common/colors/menuColors.js';
import './vscode/src/vs/platform/theme/common/colors/minimapColors.js';
import './vscode/src/vs/platform/theme/common/colors/miscColors.js';
import './vscode/src/vs/platform/theme/common/colors/quickpickColors.js';
import './vscode/src/vs/platform/theme/common/colors/searchColors.js';
import './vscode/src/vs/base/common/charCode.js';
import './vscode/src/vs/base/common/marshallingIds.js';
import './vscode/src/vs/base/common/path.js';
import './vscode/src/vs/base/common/platform.js';
import { ITextModelService } from './vscode/src/vs/editor/common/services/resolverService.service.js';
import { VSBuffer } from './vscode/src/vs/base/common/buffer.js';
import { ServiceCollection } from './vscode/src/vs/platform/instantiation/common/serviceCollection.js';
import { StandaloneQuickInputService } from './vscode/src/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import { SyncDescriptor } from './vscode/src/vs/platform/instantiation/common/descriptors.js';
export { ContextKeyExpr, RawContextKey } from './vscode/src/vs/platform/contextkey/common/contextkey.js';
import { ICodeEditorService } from './vscode/src/vs/editor/browser/services/codeEditorService.service.js';
import './vscode/src/vs/platform/keybinding/common/keybindingResolver.js';
import './vscode/src/vs/base/common/keybindings.js';
import './vscode/src/vs/base/common/event.js';
import { IFileService } from './vscode/src/vs/platform/files/common/files.service.js';
import { ResourceContextKey } from './vscode/src/vs/workbench/common/contextkeys.js';
import { IContextKeyService } from './vscode/src/vs/platform/contextkey/common/contextkey.service.js';
import { IKeybindingService } from './vscode/src/vs/platform/keybinding/common/keybinding.service.js';
import { ICommandService } from './vscode/src/vs/platform/commands/common/commands.service.js';
import { ITelemetryService } from './vscode/src/vs/platform/telemetry/common/telemetry.service.js';
import { INotificationService } from './vscode/src/vs/platform/notification/common/notification.service.js';
import { ILogService } from './vscode/src/vs/platform/log/common/log.service.js';
import { IQuickInputService } from './vscode/src/vs/platform/quickinput/common/quickInput.service.js';
import { createInjectedClass } from './tools/injection.js';
import { getService } from './services.js';
export { EditorAction, EditorCommand, EditorContributionInstantiation, registerDiffEditorContribution, registerEditorAction, registerEditorContribution, registerMultiEditorAction } from './vscode/src/vs/editor/browser/editorExtensions.js';

function computeConfiguration(configuration, overrides) {
    const editorConfiguration = isObject(configuration.editor)
        ? deepClone(configuration.editor)
        : Object.create(null);
    Object.assign(editorConfiguration, deepClone(overrides));
    return editorConfiguration;
}
function computeDiffConfiguration(configuration, overrides) {
    const editorConfiguration = computeConfiguration(configuration);
    if (isObject(configuration.diffEditor)) {
        const diffEditorConfiguration = deepClone(configuration.diffEditor);
        diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
        delete diffEditorConfiguration.codeLens;
        diffEditorConfiguration.diffWordWrap = (diffEditorConfiguration.wordWrap);
        delete diffEditorConfiguration.wordWrap;
        Object.assign(editorConfiguration, diffEditorConfiguration);
    }
    editorConfiguration.accessibilityVerbose =
        configuration.accessibility?.verbosity?.diffEditor ?? false;
    Object.assign(editorConfiguration, deepClone(overrides));
    return editorConfiguration;
}
function createConfiguredEditorClass(impl) {
    let ConfiguredStandaloneEditor = class ConfiguredStandaloneEditor extends impl {
        constructor(domElement, _options = {}, instantiationService, textResourceConfigurationService) {
            const { theme, autoDetectHighContrast, model, value, language, accessibilityHelpUrl, ariaContainerElement, overflowWidgetsDomNode, dimension, ...options } = _options;
            const computedOptions = computeConfiguration(textResourceConfigurationService.getValue(_options.model?.uri), options);
            super(instantiationService, domElement, {
                ...computedOptions,
                overflowWidgetsDomNode,
                dimension,
                theme,
                autoDetectHighContrast,
                model,
                value,
                language,
                accessibilityHelpUrl,
                ariaContainerElement
            });
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.optionsOverrides = {};
            this.lastAppliedEditorOptions = computedOptions;
            this.optionsOverrides = options;
            this._register(textResourceConfigurationService.onDidChangeConfiguration((e) => {
                const resource = this.getModel()?.uri;
                if (resource != null && e.affectsConfiguration(resource, 'editor')) {
                    this.updateEditorConfiguration();
                }
            }));
            this._register(this.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
            this._register(this.onDidChangeModel(() => this.updateEditorConfiguration()));
            this.updateEditorConfiguration();
            const scopedInstantiationService = instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService]));
            const resourceContext = this._register(scopedInstantiationService.createInstance(ResourceContextKey));
            this.onDidChangeModel((e) => {
                resourceContext.set(e.newModelUrl);
            });
            resourceContext.set(this.getModel()?.uri);
        }
        updateEditorConfiguration() {
            if (!this.hasModel() || this.textResourceConfigurationService == null) {
                return;
            }
            const resource = this.getModel().uri;
            const configuration = this.textResourceConfigurationService.getValue(resource);
            if (configuration == null) {
                return;
            }
            const editorConfiguration = computeConfiguration(configuration, this.optionsOverrides);
            let editorSettingsToApply = editorConfiguration;
            if (this.lastAppliedEditorOptions != null) {
                editorSettingsToApply = distinct(this.lastAppliedEditorOptions, editorSettingsToApply);
            }
            if (Object.keys(editorSettingsToApply).length > 0) {
                this.lastAppliedEditorOptions = editorConfiguration;
                super.updateOptions(editorSettingsToApply);
            }
        }
        updateOptions(newOptions) {
            this.optionsOverrides ?? (this.optionsOverrides = {});
            const didChange = EditorOptionsUtil.applyUpdate(this.optionsOverrides, newOptions);
            if (!didChange) {
                return;
            }
            this.updateEditorConfiguration();
        }
    };
    ConfiguredStandaloneEditor = __decorate([
        __param(2, IInstantiationService),
        __param(3, ITextResourceConfigurationService)
    ], ConfiguredStandaloneEditor);
    return ConfiguredStandaloneEditor;
}
const ConfiguredStandaloneCodeEditor = createConfiguredEditorClass(createInjectedClass(StandaloneCodeEditor));
const ConfiguredStandaloneEditor = createConfiguredEditorClass(createInjectedClass(StandaloneEditor));
let ConfiguredStandaloneDiffEditor = class ConfiguredStandaloneDiffEditor extends createInjectedClass(StandaloneDiffEditor2) {
    constructor(domElement, _options = {}, instantiationService, textResourceConfigurationService) {
        const { theme, autoDetectHighContrast, modifiedAriaLabel, originalAriaLabel, overflowWidgetsDomNode, dimension, ...options } = _options;
        const computedOptions = computeDiffConfiguration(textResourceConfigurationService.getValue(undefined), options);
        super(instantiationService, domElement, {
            ...computedOptions,
            overflowWidgetsDomNode,
            dimension,
            theme,
            autoDetectHighContrast,
            modifiedAriaLabel,
            originalAriaLabel
        });
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.optionsOverrides = {};
        this.lastAppliedEditorOptions = computedOptions;
        this.optionsOverrides = options;
        this._register(textResourceConfigurationService.onDidChangeConfiguration((e) => {
            const resource = this._targetEditor.getModel()?.uri;
            if (resource != null &&
                (e.affectsConfiguration(resource, 'editor') ||
                    e.affectsConfiguration(resource, 'diffEditor') ||
                    e.affectsConfiguration(resource, 'accessibility.verbosity.diffEditor'))) {
                this.updateEditorConfiguration();
            }
        }));
        this._register(this._targetEditor.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
        this._register(this.onDidChangeModel(() => this.updateEditorConfiguration()));
        this.updateEditorConfiguration();
    }
    updateEditorConfiguration() {
        if (this.getModel() == null || this.textResourceConfigurationService == null) {
            return;
        }
        const resource = this._targetEditor.getModel()?.uri;
        const configuration = this.textResourceConfigurationService.getValue(resource);
        if (configuration == null) {
            return;
        }
        const editorConfiguration = computeDiffConfiguration(configuration, this.optionsOverrides);
        let editorSettingsToApply = editorConfiguration;
        if (this.lastAppliedEditorOptions != null) {
            editorSettingsToApply = distinct(this.lastAppliedEditorOptions, editorSettingsToApply);
        }
        if (Object.keys(editorSettingsToApply).length > 0) {
            this.lastAppliedEditorOptions = editorConfiguration;
            super.updateOptions(editorSettingsToApply);
        }
    }
    updateOptions(newOptions) {
        this.optionsOverrides ?? (this.optionsOverrides = {});
        this.optionsOverrides = {
            ...this.optionsOverrides,
            ...newOptions
        };
        this.updateEditorConfiguration();
    }
    _createInnerEditor(instantiationService, container, options) {
        return instantiationService.createInstance(ConfiguredStandaloneCodeEditor, container, options);
    }
};
ConfiguredStandaloneDiffEditor = __decorate([
    __param(2, IInstantiationService),
    __param(3, ITextResourceConfigurationService)
], ConfiguredStandaloneDiffEditor);
async function writeFile(uri, content) {
    const fileService = await getService(IFileService);
    await fileService.writeFile(uri, VSBuffer.fromString(content));
}
async function deleteFile(uri, options) {
    const fileService = await getService(IFileService);
    await fileService.del(uri, options);
}
async function createModelReference(resource, content) {
    if (content != null) {
        await writeFile(resource, content);
    }
    const textModelService = await getService(ITextModelService);
    return (await textModelService.createModelReference(resource));
}
function isDynamicKeybindingService(keybindingService) {
    return keybindingService.registerKeybindingProvider != null;
}
let DelegateStandaloneKeybindingService = class DelegateStandaloneKeybindingService extends StandaloneKeybindingService {
    constructor(delegate, contextKeyService, commandService, telemetryService, notificationService, logService, codeEditorService) {
        super(contextKeyService, commandService, telemetryService, notificationService, logService, codeEditorService);
        this.delegate = delegate;
        this._register(delegate.registerKeybindingProvider({
            provideKeybindings: () => {
                return this.getUserKeybindingItems();
            },
            onDidChangeKeybindings: this.onDidUpdateKeybindings
        }));
    }
    _getResolver() {
        return this.delegate._getResolver();
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this.delegate.resolveKeyboardEvent(keyboardEvent);
    }
    resolveKeybinding(keybinding) {
        return this.delegate.resolveKeybinding(keybinding);
    }
    resolveUserBinding(userBinding) {
        return this.delegate.resolveUserBinding(userBinding);
    }
    _dumpDebugInfo() {
        return this.delegate._dumpDebugInfo();
    }
    _dumpDebugInfoJSON() {
        return this.delegate._dumpDebugInfoJSON();
    }
    enableKeybindingHoldMode(commandId) {
        return this.delegate.enableKeybindingHoldMode(commandId);
    }
};
DelegateStandaloneKeybindingService = __decorate([
    __param(1, IContextKeyService),
    __param(2, ICommandService),
    __param(3, ITelemetryService),
    __param(4, INotificationService),
    __param(5, ILogService),
    __param(6, ICodeEditorService)
], DelegateStandaloneKeybindingService);
let standaloneEditorInstantiationService = null;
function getStandaloneEditorInstantiationService(accessor) {
    if (standaloneEditorInstantiationService == null) {
        const serviceCollection = new ServiceCollection();
        serviceCollection.set(IQuickInputService, new SyncDescriptor(StandaloneQuickInputService, [], true));
        const keybindingService = accessor.get(IKeybindingService);
        if (!(keybindingService instanceof StandaloneKeybindingService) &&
            isDynamicKeybindingService(keybindingService)) {
            serviceCollection.set(IKeybindingService, new SyncDescriptor(DelegateStandaloneKeybindingService, [keybindingService], true));
        }
        standaloneEditorInstantiationService = accessor
            .get(IInstantiationService)
            .createChild(serviceCollection);
    }
    return standaloneEditorInstantiationService;
}
const createConfiguredEditor = (domElement, options, override) => {
    const instantiationService = StandaloneServices.initialize(override ?? {});
    return instantiationService
        .invokeFunction(getStandaloneEditorInstantiationService)
        .createInstance(ConfiguredStandaloneEditor, domElement, options);
};
const createConfiguredDiffEditor = (domElement, options, override) => {
    const instantiationService = StandaloneServices.initialize(override ?? {});
    return instantiationService
        .invokeFunction(getStandaloneEditorInstantiationService)
        .createInstance(ConfiguredStandaloneDiffEditor, domElement, options);
};
const Extensions = {
    ...Extensions$2,
    ...Extensions$1
};

export { Extensions, createConfiguredDiffEditor, createConfiguredEditor, createModelReference, deleteFile, writeFile };
