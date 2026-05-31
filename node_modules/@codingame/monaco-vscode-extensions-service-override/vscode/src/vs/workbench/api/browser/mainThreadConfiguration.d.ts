import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { MainThreadConfigurationShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ConfigurationTarget, IConfigurationOverrides } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
export declare class MainThreadConfiguration implements MainThreadConfigurationShape {
    private readonly _workspaceContextService;
    private readonly configurationService;
    private readonly _environmentService;
    private readonly _configurationListener;
    constructor(extHostContext: IExtHostContext, _workspaceContextService: IWorkspaceContextService, configurationService: IConfigurationService, _environmentService: IEnvironmentService);
    private _getConfigurationData;
    dispose(): void;
    $updateConfigurationOption(target: ConfigurationTarget | null, key: string, value: unknown, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    $removeConfigurationOption(target: ConfigurationTarget | null, key: string, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    private writeConfiguration;
    private _updateValue;
    private deriveConfigurationTarget;
}
