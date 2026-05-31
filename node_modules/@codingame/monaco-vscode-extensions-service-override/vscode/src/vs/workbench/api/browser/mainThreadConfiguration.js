
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { Registry } from '@codingame/monaco-vscode-api/vscode/vs/platform/registry/common/platform';
import { getScopes, Extensions, ConfigurationScope } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configurationRegistry';
import { WorkbenchState } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace';
import { IWorkspaceContextService } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ConfigurationTarget } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';

let MainThreadConfiguration = class MainThreadConfiguration {
    constructor(
        extHostContext,
        _workspaceContextService,
        configurationService,
        _environmentService
    ) {
        this._workspaceContextService = _workspaceContextService;
        this.configurationService = configurationService;
        this._environmentService = _environmentService;
        const proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostConfiguration));
        proxy.$initializeConfiguration(this._getConfigurationData());
        this._configurationListener = configurationService.onDidChangeConfiguration(e => {
            proxy.$acceptConfigurationChanged(this._getConfigurationData(), e.change);
        });
    }
    _getConfigurationData() {
        const configurationData = {
            ...(this.configurationService.getConfigurationData()),
            configurationScopes: []
        };
        if (!this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment) {
            configurationData.configurationScopes = getScopes();
        }
        return configurationData;
    }
    dispose() {
        this._configurationListener.dispose();
    }
    $updateConfigurationOption(target, key, value, overrides, scopeToLanguage) {
        overrides = {
            resource: overrides?.resource ? URI.revive(overrides.resource) : undefined,
            overrideIdentifier: overrides?.overrideIdentifier
        };
        return this.writeConfiguration(target, key, value, overrides, scopeToLanguage);
    }
    $removeConfigurationOption(target, key, overrides, scopeToLanguage) {
        overrides = {
            resource: overrides?.resource ? URI.revive(overrides.resource) : undefined,
            overrideIdentifier: overrides?.overrideIdentifier
        };
        return this.writeConfiguration(target, key, undefined, overrides, scopeToLanguage);
    }
    writeConfiguration(target, key, value, overrides, scopeToLanguage) {
        target = target !== null && target !== undefined ? target : this.deriveConfigurationTarget(key, overrides);
        const configurationValue = this.configurationService.inspect(key, overrides);
        switch (target) {
        case ConfigurationTarget.MEMORY:
            return this._updateValue(
                key,
                value,
                target,
                configurationValue?.memory?.override,
                overrides,
                scopeToLanguage
            );
        case ConfigurationTarget.WORKSPACE_FOLDER:
            return this._updateValue(
                key,
                value,
                target,
                configurationValue?.workspaceFolder?.override,
                overrides,
                scopeToLanguage
            );
        case ConfigurationTarget.WORKSPACE:
            return this._updateValue(
                key,
                value,
                target,
                configurationValue?.workspace?.override,
                overrides,
                scopeToLanguage
            );
        case ConfigurationTarget.USER_REMOTE:
            return this._updateValue(
                key,
                value,
                target,
                configurationValue?.userRemote?.override,
                overrides,
                scopeToLanguage
            );
        default:
            return this._updateValue(
                key,
                value,
                target,
                configurationValue?.userLocal?.override,
                overrides,
                scopeToLanguage
            );
        }
    }
    _updateValue(
        key,
        value,
        configurationTarget,
        overriddenValue,
        overrides,
        scopeToLanguage
    ) {
        overrides = scopeToLanguage === true ? overrides : scopeToLanguage === false ? {
            resource: overrides.resource
        } : overrides.overrideIdentifier && overriddenValue !== undefined ? overrides : {
            resource: overrides.resource
        };
        return this.configurationService.updateValue(key, value, overrides, configurationTarget, {
            donotNotifyError: true
        });
    }
    deriveConfigurationTarget(key, overrides) {
        if (overrides.resource && this._workspaceContextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
            const configurationProperties = ( Registry.as(Extensions.Configuration)).getConfigurationProperties();
            if (configurationProperties[key] && (configurationProperties[key].scope === ConfigurationScope.RESOURCE || configurationProperties[key].scope === ConfigurationScope.LANGUAGE_OVERRIDABLE)) {
                return ConfigurationTarget.WORKSPACE_FOLDER;
            }
        }
        return ConfigurationTarget.WORKSPACE;
    }
};
MainThreadConfiguration = __decorate([extHostNamedCustomer(MainContext.MainThreadConfiguration), ( __param(1, IWorkspaceContextService)), ( __param(2, IConfigurationService)), ( __param(3, IEnvironmentService))], MainThreadConfiguration);

export { MainThreadConfiguration };
