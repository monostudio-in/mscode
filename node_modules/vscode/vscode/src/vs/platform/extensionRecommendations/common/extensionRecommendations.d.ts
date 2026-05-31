export declare enum RecommendationSource {
    FILE = 1,
    WORKSPACE = 2,
    EXE = 3
}
export interface IExtensionRecommendations {
    source: RecommendationSource;
    extensions: string[];
    name: string;
    searchValue?: string;
}
export declare function RecommendationSourceToString(source: RecommendationSource): "file" | "workspace" | "exe";
export declare enum RecommendationsNotificationResult {
    Ignored = "ignored",
    Cancelled = "cancelled",
    TooMany = "toomany",
    IncompatibleWindow = "incompatibleWindow",
    Accepted = "reacted"
}
