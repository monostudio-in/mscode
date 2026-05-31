export declare enum McpGalleryResourceType {
    McpServersQueryService = "McpServersQueryService",
    McpServerWebUri = "McpServerWebUriTemplate",
    McpServerVersionUri = "McpServerVersionUriTemplate",
    McpServerIdUri = "McpServerIdUriTemplate",
    McpServerLatestVersionUri = "McpServerLatestVersionUriTemplate",
    McpServerNamedResourceUri = "McpServerNamedResourceUriTemplate",
    PublisherUriTemplate = "PublisherUriTemplate",
    ContactSupportUri = "ContactSupportUri",
    PrivacyPolicyUri = "PrivacyPolicyUri",
    TermsOfServiceUri = "TermsOfServiceUri",
    ReportUri = "ReportUri"
}
export type McpGalleryManifestResource = {
    readonly id: string;
    readonly type: string;
};
export interface IMcpGalleryManifest {
    readonly version: string;
    readonly url: string;
    readonly resources: readonly McpGalleryManifestResource[];
}
export declare enum McpGalleryManifestStatus {
    Available = "available",
    Unavailable = "unavailable"
}
export declare function getMcpGalleryManifestResourceUri(manifest: IMcpGalleryManifest, type: string): string | undefined;
