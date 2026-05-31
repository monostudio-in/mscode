

var RecommendationSource;
(function (RecommendationSource) {
    RecommendationSource[RecommendationSource["FILE"] = 1] = "FILE";
    RecommendationSource[RecommendationSource["WORKSPACE"] = 2] = "WORKSPACE";
    RecommendationSource[RecommendationSource["EXE"] = 3] = "EXE";
})(RecommendationSource || (RecommendationSource = {}));
function RecommendationSourceToString(source) {
    switch (source) {
        case RecommendationSource.FILE: return 'file';
        case RecommendationSource.WORKSPACE: return 'workspace';
        case RecommendationSource.EXE: return 'exe';
    }
}
var RecommendationsNotificationResult;
(function (RecommendationsNotificationResult) {
    RecommendationsNotificationResult["Ignored"] = "ignored";
    RecommendationsNotificationResult["Cancelled"] = "cancelled";
    RecommendationsNotificationResult["TooMany"] = "toomany";
    RecommendationsNotificationResult["IncompatibleWindow"] = "incompatibleWindow";
    RecommendationsNotificationResult["Accepted"] = "reacted";
})(RecommendationsNotificationResult || (RecommendationsNotificationResult = {}));

export { RecommendationSource, RecommendationSourceToString, RecommendationsNotificationResult };
