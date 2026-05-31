import { URI } from "../../../base/common/uri.js";
import { IExtensionRecommendations, RecommendationsNotificationResult } from "./extensionRecommendations.js";
export declare const IExtensionRecommendationNotificationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionRecommendationNotificationService>;
export interface IExtensionRecommendationNotificationService {
    readonly _serviceBrand: undefined;
    readonly ignoredRecommendations: string[];
    hasToIgnoreRecommendationNotifications(): boolean;
    promptImportantExtensionsInstallNotification(recommendations: IExtensionRecommendations): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: Array<string | URI>): Promise<void>;
}
