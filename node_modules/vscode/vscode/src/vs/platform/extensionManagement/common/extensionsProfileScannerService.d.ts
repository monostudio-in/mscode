import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { Metadata } from "./extensionManagement.js";
import { IExtension, IExtensionIdentifier } from "../../extensions/common/extensions.js";
import { IFileService } from "../../files/common/files.service.js";
import { ILogService } from "../../log/common/log.service.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.service.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.service.js";
import { IExtensionsProfileScannerService } from "./extensionsProfileScannerService.service.js";
export declare enum ExtensionsProfileScanningErrorCode {
    /**
     * Error when trying to scan extensions from a profile that does not exist.
     */
    ERROR_PROFILE_NOT_FOUND = "ERROR_PROFILE_NOT_FOUND",
    /**
     * Error when profile file is invalid.
     */
    ERROR_INVALID_CONTENT = "ERROR_INVALID_CONTENT"
}
export declare class ExtensionsProfileScanningError extends Error {
    code: ExtensionsProfileScanningErrorCode;
    constructor(message: string, code: ExtensionsProfileScanningErrorCode);
}
export interface IScannedProfileExtension {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly location: URI;
    readonly metadata?: Metadata;
}
export interface ProfileExtensionsEvent {
    readonly extensions: readonly IScannedProfileExtension[];
    readonly profileLocation: URI;
}
export interface DidAddProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface DidRemoveProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface IProfileExtensionsScanOptions {
    readonly bailOutWhenFileNotFound?: boolean;
}
export declare abstract class AbstractExtensionsProfileScannerService extends Disposable implements IExtensionsProfileScannerService {
    private readonly extensionsLocation;
    private readonly fileService;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onAddExtensions;
    readonly onAddExtensions: import("../../../base/common/event.js").Event<ProfileExtensionsEvent>;
    private readonly _onDidAddExtensions;
    readonly onDidAddExtensions: import("../../../base/common/event.js").Event<DidAddProfileExtensionsEvent>;
    private readonly _onRemoveExtensions;
    readonly onRemoveExtensions: import("../../../base/common/event.js").Event<ProfileExtensionsEvent>;
    private readonly _onDidRemoveExtensions;
    readonly onDidRemoveExtensions: import("../../../base/common/event.js").Event<DidRemoveProfileExtensionsEvent>;
    private readonly resourcesAccessQueueMap;
    constructor(extensionsLocation: URI, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, logService: ILogService);
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [
        IExtension,
        Metadata | undefined
    ][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [
        IExtension,
        Metadata
    ][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionsFromProfile(extensions: IExtensionIdentifier[], profileLocation: URI): Promise<void>;
    private withProfileExtensions;
    private throwInvalidConentError;
    private toRelativePath;
    private resolveExtensionLocation;
    private _migrationPromise;
    private migrateFromOldDefaultProfileExtensionsLocation;
    private getResourceAccessQueue;
}
