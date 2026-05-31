import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IFileService } from "../../files/common/files.service.js";
import { IStorageService } from "../../storage/common/storage.service.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.service.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.service.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractFileSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from "./abstractSynchronizer.js";
import { IRemoteUserData, IUserDataSyncConfiguration, IUserDataSynchroniser, SyncResource } from "./userDataSync.js";
import { IUserDataSyncLogService } from "./userDataSync.service.js";
import { IUserDataSyncEnablementService } from "./userDataSync.service.js";
import { IUserDataSyncLocalStoreService } from "./userDataSync.service.js";
import { IUserDataSyncStoreService } from "./userDataSync.service.js";
export interface IJsonResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
export declare abstract class AbstractJsonSynchronizer extends AbstractFileSynchroniser implements IUserDataSynchroniser {
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    constructor(fileResource: URI, syncResourceMetadata: {
        syncResource: SyncResource;
        profile: IUserDataProfile;
    }, collection: string | undefined, previewFileName: string, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService);
    protected abstract getContentFromSyncContent(syncContent: string): string | null;
    protected abstract toSyncContent(content: string | null): object;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration): Promise<IJsonResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IJsonResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IJsonResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [
        IJsonResourcePreview,
        IAcceptResult
    ][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    private merge;
}
