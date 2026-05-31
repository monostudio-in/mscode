

var McpGalleryResourceType;
(function (McpGalleryResourceType) {
    McpGalleryResourceType["McpServersQueryService"] = "McpServersQueryService";
    McpGalleryResourceType["McpServerWebUri"] = "McpServerWebUriTemplate";
    McpGalleryResourceType["McpServerVersionUri"] = "McpServerVersionUriTemplate";
    McpGalleryResourceType["McpServerIdUri"] = "McpServerIdUriTemplate";
    McpGalleryResourceType["McpServerLatestVersionUri"] = "McpServerLatestVersionUriTemplate";
    McpGalleryResourceType["McpServerNamedResourceUri"] = "McpServerNamedResourceUriTemplate";
    McpGalleryResourceType["PublisherUriTemplate"] = "PublisherUriTemplate";
    McpGalleryResourceType["ContactSupportUri"] = "ContactSupportUri";
    McpGalleryResourceType["PrivacyPolicyUri"] = "PrivacyPolicyUri";
    McpGalleryResourceType["TermsOfServiceUri"] = "TermsOfServiceUri";
    McpGalleryResourceType["ReportUri"] = "ReportUri";
})(McpGalleryResourceType || (McpGalleryResourceType = {}));
var McpGalleryManifestStatus;
(function (McpGalleryManifestStatus) {
    McpGalleryManifestStatus["Available"] = "available";
    McpGalleryManifestStatus["Unavailable"] = "unavailable";
})(McpGalleryManifestStatus || (McpGalleryManifestStatus = {}));
function getMcpGalleryManifestResourceUri(manifest, type) {
    const [name, version] = type.split('/');
    for (const resource of manifest.resources) {
        const [r, v] = resource.type.split('/');
        if (r !== name) {
            continue;
        }
        if (!version || v === version) {
            return resource.id;
        }
        break;
    }
    return undefined;
}

export { McpGalleryManifestStatus, McpGalleryResourceType, getMcpGalleryManifestResourceUri };
