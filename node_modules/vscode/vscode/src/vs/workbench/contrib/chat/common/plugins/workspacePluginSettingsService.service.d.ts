import { IObservable } from "../../../../../base/common/observable.js";
import { IWorkspaceMarketplaceEntry } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/plugins/workspacePluginSettingsService";
export declare const IWorkspacePluginSettingsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacePluginSettingsService>;
export interface IWorkspacePluginSettingsService {
    readonly _serviceBrand: undefined;
    /**
    * Marketplace references parsed from `extraKnownMarketplaces` in workspace
    * settings files (`.claude/settings.json`, `.github/copilot/settings.json`).
    */
    readonly extraMarketplaces: IObservable<readonly IWorkspaceMarketplaceEntry[]>;
    /**
    * Plugin recommendation map parsed from `enabledPlugins` in workspace
    * settings files.
    * Keys are `"pluginName@marketplaceName"`, values indicate recommendation.
    */
    readonly enabledPlugins: IObservable<ReadonlyMap<string, boolean>>;
}
