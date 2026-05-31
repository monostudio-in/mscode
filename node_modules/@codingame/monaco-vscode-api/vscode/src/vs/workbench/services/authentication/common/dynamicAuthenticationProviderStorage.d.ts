import { IAuthorizationTokenResponse } from "../../../../base/common/oauth.js";
export interface DynamicAuthenticationProviderInfo {
    readonly providerId: string;
    readonly label: string;
    /**
     * @deprecated in favor of authorizationServer
     */
    readonly issuer?: string;
    readonly authorizationServer: string;
    readonly clientId: string;
}
export interface DynamicAuthenticationProviderTokensChangeEvent {
    readonly authProviderId: string;
    readonly clientId: string;
    readonly tokens: (IAuthorizationTokenResponse & {
        created_at: number;
    })[] | undefined;
}
