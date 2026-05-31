import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { ResolverResult, IRemoteConnectionData, ResolvedAuthority, ResolvedOptions } from "./remoteAuthorityResolver.js";
export declare const IRemoteAuthorityResolverService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteAuthorityResolverService>;
export interface IRemoteAuthorityResolverService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeConnectionData: Event<void>;
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    /**
    * Get the canonical URI for a `vscode-remote://` URI.
    *
    * **NOTE**: This can throw e.g. in cases where there is no resolver installed for the specific remote authority.
    *
    * @param uri The `vscode-remote://` URI
    */
    getCanonicalURI(uri: URI): Promise<URI>;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority, resolvedOptions?: ResolvedOptions): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
