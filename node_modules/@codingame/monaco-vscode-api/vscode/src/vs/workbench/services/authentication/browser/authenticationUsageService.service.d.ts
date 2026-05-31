import { IAccountUsage } from "@codingame/monaco-vscode-authentication-service-override/vscode/vs/workbench/services/authentication/browser/authenticationUsageService";
export declare const IAuthenticationUsageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationUsageService>;
export interface IAuthenticationUsageService {
    readonly _serviceBrand: undefined;
    /**
    * Initializes the cache of extensions that use authentication. Ideally used in a contribution that can be run eventually after the workspace is loaded.
    */
    initializeExtensionUsageCache(): Promise<void>;
    /**
    * Checks if an extension uses authentication
    * @param extensionId The id of the extension to check
    */
    extensionUsesAuth(extensionId: string): Promise<boolean>;
    /**
    * Reads the usages for an account
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    */
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    /**
    *
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    */
    removeAccountUsage(providerId: string, accountName: string): void;
    /**
    * Adds a usage for an account
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    * @param extensionId The id of the extension to add a usage for
    * @param extensionName The name of the extension to add a usage for
    */
    addAccountUsage(providerId: string, accountName: string, scopes: ReadonlyArray<string> | undefined, extensionId: string, extensionName: string): void;
}
