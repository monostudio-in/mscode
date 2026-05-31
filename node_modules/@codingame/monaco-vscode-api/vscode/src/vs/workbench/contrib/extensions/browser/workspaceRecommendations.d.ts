import { ExtensionRecommendations, ExtensionRecommendation } from "./extensionRecommendations.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IWorkspaceExtensionsConfigService } from "../../../services/extensionRecommendations/common/workspaceExtensionsConfig.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { IWorkbenchExtensionManagementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
export declare class WorkspaceRecommendations extends ExtensionRecommendations {
    private readonly workspaceExtensionsConfigService;
    private readonly contextService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly workbenchExtensionManagementService;
    private readonly notificationService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("../../../../base/common/event.js").Event<void>;
    private _ignoredRecommendations;
    get ignoredRecommendations(): ReadonlyArray<string>;
    private workspaceExtensions;
    private readonly onDidChangeWorkspaceExtensionsScheduler;
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, fileService: IFileService, workbenchExtensionManagementService: IWorkbenchExtensionManagementService, notificationService: INotificationService);
    protected doActivate(): Promise<void>;
    private onDidChangeWorkspaceExtensionsFolders;
    private fetchWorkspaceExtensions;
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    private fetch;
    private validateExtensions;
    private onDidChangeExtensionsConfigs;
}
