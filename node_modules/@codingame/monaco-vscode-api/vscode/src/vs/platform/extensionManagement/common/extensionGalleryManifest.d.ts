export declare enum ExtensionGalleryResourceType {
    ExtensionQueryService = "ExtensionQueryService",
    ExtensionLatestVersionUri = "ExtensionLatestVersionUriTemplate",
    ExtensionStatisticsUri = "ExtensionStatisticsUriTemplate",
    PublisherViewUri = "PublisherViewUriTemplate",
    ExtensionDetailsViewUri = "ExtensionDetailsViewUriTemplate",
    ExtensionRatingViewUri = "ExtensionRatingViewUriTemplate",
    ExtensionResourceUri = "ExtensionResourceUriTemplate",
    ContactSupportUri = "ContactSupportUri"
}
export declare enum Flag {
    None = "None",
    IncludeVersions = "IncludeVersions",
    IncludeFiles = "IncludeFiles",
    IncludeCategoryAndTags = "IncludeCategoryAndTags",
    IncludeSharedAccounts = "IncludeSharedAccounts",
    IncludeVersionProperties = "IncludeVersionProperties",
    ExcludeNonValidated = "ExcludeNonValidated",
    IncludeInstallationTargets = "IncludeInstallationTargets",
    IncludeAssetUri = "IncludeAssetUri",
    IncludeStatistics = "IncludeStatistics",
    IncludeLatestVersionOnly = "IncludeLatestVersionOnly",
    Unpublished = "Unpublished",
    IncludeNameConflictInfo = "IncludeNameConflictInfo",
    IncludeLatestPrereleaseAndStableVersionOnly = "IncludeLatestPrereleaseAndStableVersionOnly"
}
export type ExtensionGalleryManifestResource = {
    readonly id: string;
    readonly type: string;
};
export type ExtensionQueryCapabilityValue = {
    readonly name: string;
    readonly value: number;
};
export interface IExtensionGalleryManifest {
    readonly version: string;
    readonly resources: readonly ExtensionGalleryManifestResource[];
    readonly capabilities: {
        readonly extensionQuery: {
            readonly filtering?: readonly ExtensionQueryCapabilityValue[];
            readonly sorting?: readonly ExtensionQueryCapabilityValue[];
            readonly flags?: readonly ExtensionQueryCapabilityValue[];
        };
        readonly signing?: {
            readonly allPublicRepositorySigned: boolean;
            readonly allPrivateRepositorySigned?: boolean;
        };
        readonly extensions?: {
            readonly includePublicExtensions?: boolean;
            readonly includePrivateExtensions?: boolean;
        };
    };
}
export declare enum ExtensionGalleryManifestStatus {
    Available = "available",
    RequiresSignIn = "requiresSignIn",
    AccessDenied = "accessDenied",
    Unavailable = "unavailable"
}
export declare function getExtensionGalleryManifestResourceUri(manifest: IExtensionGalleryManifest, type: string): string | undefined;
export declare const ExtensionGalleryServiceUrlConfigKey = "extensions.gallery.serviceUrl";
