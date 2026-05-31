export declare enum ExtensionRecommendationReason {
    Workspace = 0,
    File = 1,
    Executable = 2,
    WorkspaceConfig = 3,
    DynamicWorkspace = 4,
    Experimental = 5,
    Application = 6
}
export interface IExtensionRecommendationReason {
    reasonId: ExtensionRecommendationReason;
    reasonText: string;
}
export type IgnoredRecommendationChangeNotification = {
    extensionId: string;
    isRecommended: boolean;
};
