import { MarketplaceType } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/plugins/pluginMarketplaceService";
/**
 * Options for ensuring a marketplace repository is available locally.
 */
export interface IEnsureRepositoryOptions {
    /** Optional progress notification title shown during clone. */
    readonly progressTitle?: string;
    /** Label used in clone failure messaging. */
    readonly failureLabel?: string;
    /** Marketplace type metadata to persist in the marketplace index. */
    readonly marketplaceType?: MarketplaceType;
}
/**
 * Options for pulling the latest changes from a cloned marketplace repository.
 */
export interface IPullRepositoryOptions {
    /** Optional plugin name used in progress messaging. */
    readonly pluginName?: string;
    /** Label used in pull failure messaging. */
    readonly failureLabel?: string;
    /** Marketplace type metadata for repository index updates. */
    readonly marketplaceType?: MarketplaceType;
    /** When `true`, suppresses progress notifications. */
    readonly silent?: boolean;
}
