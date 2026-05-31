import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IExtensionRecommendations, RecommendationsNotificationResult } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.service.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IWorkbenchExtensionManagementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IExtensionIgnoredRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.service.js";
export declare class ExtensionRecommendationNotificationService extends Disposable implements IExtensionRecommendationNotificationService {
    private readonly configurationService;
    private readonly storageService;
    private readonly notificationService;
    private readonly telemetryService;
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly userDataSyncEnablementService;
    private readonly workbenchEnvironmentService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    get ignoredRecommendations(): string[];
    private recommendedExtensions;
    private recommendationSources;
    private hideVisibleNotificationPromise;
    private visibleNotification;
    private pendingNotificaitons;
    constructor(configurationService: IConfigurationService, storageService: IStorageService, notificationService: INotificationService, telemetryService: ITelemetryService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementService: IWorkbenchExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService, userDataSyncEnablementService: IUserDataSyncEnablementService, workbenchEnvironmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService);
    hasToIgnoreRecommendationNotifications(): boolean;
    promptImportantExtensionsInstallNotification(extensionRecommendations: IExtensionRecommendations): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: Array<string | URI>): Promise<void>;
    private promptRecommendationsNotification;
    private showRecommendationsNotification;
    private waitUntilRecommendationsAreInstalled;
    /**
     * Show recommendations in Queue
     * At any time only one recommendation is shown
     * If a new recommendation comes in
     * 		=> If no recommendation is visible, show it immediately
     *		=> Otherwise, add to the pending queue
     * 			=> If it is not exe based and has higher or same priority as current, hide the current notification after showing it for 3s.
     * 			=> Otherwise wait until the current notification is hidden.
     */
    private doShowRecommendationsNotification;
    private showNextNotification;
    /**
     * Return the recent high priroity pending notification
     */
    private getNextPendingNotificationIndex;
    private hideVisibleNotification;
    private unsetVisibileNotification;
    private getInstallableExtensions;
    private addToImportantRecommendationsIgnore;
    private setIgnoreRecommendationsConfig;
    private _registerP;
}
