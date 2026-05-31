import { IMarketplacePlugin } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/plugins/pluginMarketplaceService";
export interface IUpdateAllPluginsOptions {
    /**
     * When `true`, also re-installs npm/pip packages that have no pinned
     * version. Defaults to `false` to avoid interactive terminal prompts
     * during background updates.
     */
    readonly force?: boolean;
    /**
     * When `true`, suppresses the progress notification. An info
     * notification is still shown listing any plugins that were
     * updated, and error notifications are shown on failure.
     */
    readonly silent?: boolean;
}
export interface IUpdateAllPluginsResult {
    /** Names of plugins/marketplaces that were updated successfully. */
    readonly updatedNames: readonly string[];
    /** Names of plugins/marketplaces that failed to update. */
    readonly failedNames: readonly string[];
}
export interface IInstallPluginFromSourceOptions {
    /**
     * When set, targets a specific plugin by name within the marketplace
     * instead of installing all or prompting the user. The matched plugin
     * is installed and returned in the result.
     */
    readonly plugin?: string;
}
export interface IInstallPluginFromSourceResult {
    readonly success: boolean;
    readonly message?: string;
    /**
     * When {@link IInstallPluginFromSourceOptions.plugin} is set and the
     * plugin was found, this contains the discovered marketplace plugin.
     */
    readonly matchedPlugin?: IMarketplacePlugin;
}
