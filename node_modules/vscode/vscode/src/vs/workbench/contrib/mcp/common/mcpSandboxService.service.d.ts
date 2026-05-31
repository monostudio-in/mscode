import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IMcpSandboxConfiguration } from "../../../../platform/mcp/common/mcpPlatformTypes.js";
import { SandboxConfigSuggestionResult } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/workbench/contrib/mcp/common/mcpSandboxService";
import { McpServerDefinition, McpServerLaunch, IMcpPotentialSandboxBlock } from "./mcpTypes.js";
export declare const IMcpSandboxService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpSandboxService>;
export interface IMcpSandboxService {
    readonly _serviceBrand: undefined;
    launchInSandboxIfEnabled(serverDef: McpServerDefinition, launch: McpServerLaunch, remoteAuthority: string | undefined, configTarget: ConfigurationTarget): Promise<McpServerLaunch>;
    isEnabled(serverDef: McpServerDefinition, serverLabel?: string): Promise<boolean>;
    getSandboxConfigSuggestionMessage(serverLabel: string, potentialBlocks: readonly IMcpPotentialSandboxBlock[], existingSandboxConfig?: IMcpSandboxConfiguration): SandboxConfigSuggestionResult | undefined;
    applySandboxConfigSuggestion(serverDef: McpServerDefinition, mcpResource: URI, configTarget: ConfigurationTarget, potentialBlocks: readonly IMcpPotentialSandboxBlock[], suggestedSandboxConfig?: IMcpSandboxConfiguration): Promise<boolean>;
}
