import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IFileService } from "../../files/common/files.service.js";
import { ILogService } from "../../log/common/log.service.js";
import { IStorageService } from "../../storage/common/storage.service.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.service.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.service.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.service.js";
import { AbstractJsonSynchronizer } from "./abstractJsonSynchronizer.js";
import { AbstractInitializer } from "./abstractSynchronizer.js";
import { IRemoteUserData, IUserDataSynchroniser } from "./userDataSync.js";
import { IUserDataSyncLogService } from "./userDataSync.service.js";
import { IUserDataSyncEnablementService } from "./userDataSync.service.js";
import { IUserDataSyncLocalStoreService } from "./userDataSync.service.js";
import { IUserDataSyncStoreService } from "./userDataSync.service.js";
interface ITasksSyncContent {
    tasks?: string;
}
export declare function getTasksContentFromSyncContent(syncContent: string, logService: ILogService): string | null;
export declare class TasksSynchroniser extends AbstractJsonSynchronizer implements IUserDataSynchroniser {
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected getContentFromSyncContent(syncContent: string): string | null;
    protected toSyncContent(tasks: string | null): ITasksSyncContent;
}
export declare class TasksInitializer extends AbstractInitializer {
    private tasksResource;
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
}
export {};
