import { URI } from "../../../../../base/common/uri.js";
import { IEnsureRepositoryOptions, IPullRepositoryOptions } from "./agentPluginRepositoryService.js";
import { IMarketplaceReference } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/plugins/marketplaceReference";
import { MarketplaceType, IMarketplacePlugin, IPluginSourceDescriptor, PluginSourceKind } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/plugins/pluginMarketplaceService";
import { IPluginSource } from "./pluginSource.js";
export declare const IAgentPluginRepositoryService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentPluginRepositoryService>;
/**
* Manages cloning, cache location resolution, and update operations for
* agent plugin marketplace repositories.
*/
export interface IAgentPluginRepositoryService {
    readonly _serviceBrand: undefined;
    /**
    * Root directory where agent plugins are stored on disk.
    * On native this is `~/{dataFolderName}/agent-plugins/`; on web it
    * falls back to `{cacheHome}/agentPlugins/`.
    */
    readonly agentPluginsHome: URI;
    /**
    * Returns the local cache URI for a marketplace repository reference.
    * Uses a storage-backed marketplace index when available.
    */
    getRepositoryUri(marketplace: IMarketplaceReference, marketplaceType?: MarketplaceType): URI;
    /**
    * Returns the local install URI for a plugin source directory inside its
    * marketplace repository cache.
    */
    getPluginInstallUri(plugin: IMarketplacePlugin): URI;
    /**
    * Ensures a marketplace repository is cloned locally and returns its cache URI.
    */
    ensureRepository(marketplace: IMarketplaceReference, options?: IEnsureRepositoryOptions): Promise<URI>;
    /**
    * Pulls latest changes for a cloned marketplace repository.
    * Returns `true` if the pull brought in new changes.
    */
    pullRepository(marketplace: IMarketplaceReference, options?: IPullRepositoryOptions): Promise<boolean>;
    /**
    * Returns the local install URI for a plugin based on its
    * {@link IPluginSourceDescriptor}. For non-relative-path sources
    * (github, url, npm, pip), this computes a cache location independent
    * of the marketplace repository.
    */
    getPluginSourceInstallUri(sourceDescriptor: IPluginSourceDescriptor): URI;
    /**
    * Ensures the plugin source is available locally. For github/url sources
    * this clones the repository into the cache. For npm/pip sources this is
    * a no-op (installation via terminal is handled by the install service).
    */
    ensurePluginSource(plugin: IMarketplacePlugin, options?: IEnsureRepositoryOptions): Promise<URI>;
    /**
    * Updates a plugin source that is stored outside the marketplace repository.
    * For github/url sources this pulls latest changes and reapplies pinned
    * ref/sha checkout. For npm/pip sources this is a no-op.
    * Returns `true` if the update brought in new changes.
    */
    updatePluginSource(plugin: IMarketplacePlugin, options?: IPullRepositoryOptions): Promise<boolean>;
    /**
    * Returns the {@link IPluginSource} strategy for the given
    * source kind, allowing callers to invoke kind-specific operations
    * (install, update, label, etc.) directly.
    */
    getPluginSource(kind: PluginSourceKind): IPluginSource;
    /**
    * Cleans up on-disk cache for a plugin source that owns its own install
    * directory. For marketplace-relative sources this is a no-op (they share
    * the marketplace repository cache). For direct sources (github, url, npm,
    * pip) the cache directory is deleted.
    *
    * When {@link otherInstalledDescriptors} is provided, deletion is skipped
    * if any of those descriptors share the same cleanup target directory
    * (e.g. multiple plugins installed from the same cloned repository).
    *
    * This is best-effort: failures are logged but do not throw.
    */
    cleanupPluginSource(plugin: IMarketplacePlugin, otherInstalledDescriptors?: readonly IPluginSourceDescriptor[]): Promise<void>;
    /**
    * Silently fetches remote refs for a cloned marketplace repository and
    * returns whether the local branch is behind the remote (i.e. updates
    * are available). Returns `false` if the repo is not cloned or on
    * network failure.
    */
    fetchRepository(marketplace: IMarketplaceReference): Promise<boolean>;
}
