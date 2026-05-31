

var RegistryType;
(function (RegistryType) {
    RegistryType["NODE"] = "npm";
    RegistryType["PYTHON"] = "pypi";
    RegistryType["DOCKER"] = "oci";
    RegistryType["NUGET"] = "nuget";
    RegistryType["MCPB"] = "mcpb";
    RegistryType["REMOTE"] = "remote";
})(RegistryType || (RegistryType = {}));
var TransportType;
(function (TransportType) {
    TransportType["STDIO"] = "stdio";
    TransportType["STREAMABLE_HTTP"] = "streamable-http";
    TransportType["SSE"] = "sse";
})(TransportType || (TransportType = {}));
var GalleryMcpServerStatus;
(function (GalleryMcpServerStatus) {
    GalleryMcpServerStatus["Active"] = "active";
    GalleryMcpServerStatus["Deprecated"] = "deprecated";
})(GalleryMcpServerStatus || (GalleryMcpServerStatus = {}));
const mcpAccessConfig = 'chat.mcp.access';
const mcpGalleryServiceUrlConfig = 'chat.mcp.gallery.serviceUrl';
const mcpGalleryServiceEnablementConfig = 'chat.mcp.gallery.enabled';
const mcpAutoStartConfig = 'chat.mcp.autostart';
const mcpAppsEnabledConfig = 'chat.mcp.apps.enabled';
var McpAutoStartValue;
(function (McpAutoStartValue) {
    McpAutoStartValue["Never"] = "never";
    McpAutoStartValue["OnlyNew"] = "onlyNew";
    McpAutoStartValue["NewAndOutdated"] = "newAndOutdated";
})(McpAutoStartValue || (McpAutoStartValue = {}));
var McpAccessValue;
(function (McpAccessValue) {
    McpAccessValue["None"] = "none";
    McpAccessValue["Registry"] = "registry";
    McpAccessValue["All"] = "all";
})(McpAccessValue || (McpAccessValue = {}));

export { GalleryMcpServerStatus, McpAccessValue, McpAutoStartValue, RegistryType, TransportType, mcpAccessConfig, mcpAppsEnabledConfig, mcpAutoStartConfig, mcpGalleryServiceEnablementConfig, mcpGalleryServiceUrlConfig };
