

var ExtensionRecommendationReason;
(function (ExtensionRecommendationReason) {
    ExtensionRecommendationReason[ExtensionRecommendationReason["Workspace"] = 0] = "Workspace";
    ExtensionRecommendationReason[ExtensionRecommendationReason["File"] = 1] = "File";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Executable"] = 2] = "Executable";
    ExtensionRecommendationReason[ExtensionRecommendationReason["WorkspaceConfig"] = 3] = "WorkspaceConfig";
    ExtensionRecommendationReason[ExtensionRecommendationReason["DynamicWorkspace"] = 4] = "DynamicWorkspace";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Experimental"] = 5] = "Experimental";
    ExtensionRecommendationReason[ExtensionRecommendationReason["Application"] = 6] = "Application";
})(ExtensionRecommendationReason || (ExtensionRecommendationReason = {}));

export { ExtensionRecommendationReason };
