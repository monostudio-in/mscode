import { VSBufferReadableStream } from "../../../base/common/buffer.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { Event } from "../../../base/common/event.js";
import { FormattingOptions } from "../../../base/common/jsonFormatter.js";
import { URI } from "../../../base/common/uri.js";
import { IHeaders } from "../../../base/parts/request/common/request.js";
import { ILogService } from "../../log/common/log.service.js";
import { IUserDataSyncStore, UserDataSyncStoreType, type IResourceRefHandle, type ISyncResourceHandle, type ISyncUserDataProfile, type IUserData, type IUserDataManifest, type IUserDataManualSyncTask, type IUserDataSyncLatestData, type IUserDataSyncResource, type IUserDataSyncResourceConflicts, type IUserDataSyncResourceError, type IUserDataSyncTask, type ServerResource, type SyncOptions, type SyncResource, type SyncStatus, type UserDataSyncError, type UserDataSyncErrorCode } from "./userDataSync.js";
import { IUserDataSyncMachine } from "./userDataSyncMachines.js";
export declare const IUserDataSyncStoreManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncStoreManagementService>;
export interface IUserDataSyncStoreManagementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeUserDataSyncStore: Event<void>;
    readonly userDataSyncStore: IUserDataSyncStore | undefined;
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore | undefined>;
}
export declare const IUserDataSyncStoreService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncStoreService>;
export interface IUserDataSyncStoreService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDonotMakeRequestsUntil: Event<void>;
    readonly donotMakeRequestsUntil: Date | undefined;
    readonly onTokenFailed: Event<UserDataSyncErrorCode>;
    readonly onTokenSucceed: Event<void>;
    setAuthToken(token: string, type: string): void;
    manifest(oldValue: IUserDataManifest | null, headers?: IHeaders): Promise<IUserDataManifest | null>;
    readResource(resource: ServerResource, oldValue: IUserData | null, collection?: string, headers?: IHeaders): Promise<IUserData>;
    writeResource(resource: ServerResource, content: string, ref: string | null, collection?: string, headers?: IHeaders): Promise<string>;
    deleteResource(resource: ServerResource, ref: string | null, collection?: string): Promise<void>;
    getAllResourceRefs(resource: ServerResource, collection?: string): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resource: ServerResource, ref: string, collection?: string, headers?: IHeaders): Promise<string | null>;
    getAllCollections(headers?: IHeaders): Promise<string[]>;
    createCollection(headers?: IHeaders): Promise<string>;
    deleteCollection(collection?: string, headers?: IHeaders): Promise<void>;
    getLatestData(headers?: IHeaders): Promise<IUserDataSyncLatestData | null>;
    getActivityData(): Promise<VSBufferReadableStream>;
    clear(): Promise<void>;
}
export declare const IUserDataSyncLocalStoreService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncLocalStoreService>;
export interface IUserDataSyncLocalStoreService {
    readonly _serviceBrand: undefined;
    writeResource(resource: ServerResource, content: string, cTime: Date, collection?: string, root?: URI): Promise<void>;
    getAllResourceRefs(resource: ServerResource, collection?: string, root?: URI): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resource: ServerResource, ref: string, collection?: string, root?: URI): Promise<string | null>;
}
export declare const IUserDataSyncEnablementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncEnablementService>;
export interface IUserDataSyncEnablementService {
    _serviceBrand: undefined;
    readonly onDidChangeEnablement: Event<boolean>;
    isEnabled(): boolean;
    canToggleEnablement(): boolean;
    setEnablement(enabled: boolean): void;
    readonly onDidChangeResourceEnablement: Event<[
        SyncResource,
        boolean
    ]>;
    isResourceEnabled(resource: SyncResource, defaultValue?: boolean): boolean;
    setResourceEnablement(resource: SyncResource, enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
    /**
    * Checks if resource enabled was explicitly configured before,
    * ignoring its default enablement value used in {@link isResourceEnabled}.
    */
    isResourceEnablementConfigured(resource: SyncResource): boolean;
}
export declare const IUserDataSyncService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncService>;
export interface IUserDataSyncService {
    _serviceBrand: undefined;
    readonly status: SyncStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    readonly conflicts: IUserDataSyncResourceConflicts[];
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    readonly onDidChangeLocal: Event<SyncResource>;
    readonly onSyncErrors: Event<IUserDataSyncResourceError[]>;
    readonly lastSyncTime: number | undefined;
    readonly onDidChangeLastSyncTime: Event<number>;
    readonly onDidResetRemote: Event<void>;
    readonly onDidResetLocal: Event<void>;
    createSyncTask(manifest: IUserDataManifest | null, disableCache?: boolean): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    resolveContent(resource: URI): Promise<string | null>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null | undefined, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    cleanUpRemoteData(): Promise<void>;
    resetLocal(): Promise<void>;
    hasLocalData(): Promise<boolean>;
    hasPreviouslySynced(): Promise<boolean>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    saveRemoteActivityData(location: URI): Promise<void>;
    extractActivityData(activityDataResource: URI, location: URI): Promise<void>;
}
export declare const IUserDataSyncResourceProviderService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncResourceProviderService>;
export interface IUserDataSyncResourceProviderService {
    _serviceBrand: undefined;
    getRemoteSyncedProfiles(): Promise<ISyncUserDataProfile[]>;
    getLocalSyncedProfiles(location?: URI): Promise<ISyncUserDataProfile[]>;
    getRemoteSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile): Promise<ISyncResourceHandle[]>;
    getLocalSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile, location?: URI): Promise<ISyncResourceHandle[]>;
    getAssociatedResources(syncResourceHandle: ISyncResourceHandle): Promise<{
        resource: URI;
        comparableResource: URI;
    }[]>;
    getMachineId(syncResourceHandle: ISyncResourceHandle): Promise<string | undefined>;
    getLocalSyncedMachines(location?: URI): Promise<IUserDataSyncMachine[]>;
    resolveContent(resource: URI): Promise<string | null>;
    resolveUserDataSyncResource(syncResourceHandle: ISyncResourceHandle): IUserDataSyncResource | undefined;
}
export declare const IUserDataAutoSyncService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataAutoSyncService>;
export interface IUserDataAutoSyncService {
    _serviceBrand: undefined;
    readonly onError: Event<UserDataSyncError>;
    turnOn(): Promise<void>;
    turnOff(everywhere: boolean): Promise<void>;
    triggerSync(sources: string[], options?: SyncOptions): Promise<void>;
}
export declare const IUserDataSyncUtilService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncUtilService>;
export interface IUserDataSyncUtilService {
    readonly _serviceBrand: undefined;
    resolveUserBindings(userbindings: string[]): Promise<IStringDictionary<string>>;
    resolveFormattingOptions(resource: URI): Promise<FormattingOptions>;
    resolveDefaultCoreIgnoredSettings(): Promise<string[]>;
}
export declare const IUserDataSyncLogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncLogService>;
export interface IUserDataSyncLogService extends ILogService {
}
