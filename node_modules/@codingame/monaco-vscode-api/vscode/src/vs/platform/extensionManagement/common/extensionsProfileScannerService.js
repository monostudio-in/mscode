
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Queue } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Emitter } from '../../../base/common/event.js';
import { ResourceMap } from '../../../base/common/map.js';
import { URI } from '../../../base/common/uri.js';
import { isIExtensionIdentifier } from './extensionManagement.js';
import { areSameExtensions } from './extensionManagementUtil.js';
import { toFileOperationResult, FileOperationResult } from '../../files/common/files.js';
import { IFileService } from '../../files/common/files.service.js';
import { ILogService } from '../../log/common/log.service.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.service.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.service.js';
import { isString, isUndefined, isObject } from '../../../base/common/types.js';
import { getErrorMessage } from '../../../base/common/errors.js';

var ExtensionsProfileScanningErrorCode;
(function(ExtensionsProfileScanningErrorCode) {
    ExtensionsProfileScanningErrorCode["ERROR_PROFILE_NOT_FOUND"] = "ERROR_PROFILE_NOT_FOUND";
    ExtensionsProfileScanningErrorCode["ERROR_INVALID_CONTENT"] = "ERROR_INVALID_CONTENT";
})(
    ExtensionsProfileScanningErrorCode || (ExtensionsProfileScanningErrorCode = {})
);
class ExtensionsProfileScanningError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
let AbstractExtensionsProfileScannerService = class AbstractExtensionsProfileScannerService extends Disposable {
    constructor(
        extensionsLocation,
        fileService,
        userDataProfilesService,
        uriIdentityService,
        logService
    ) {
        super();
        this.extensionsLocation = extensionsLocation;
        this.fileService = fileService;
        this.userDataProfilesService = userDataProfilesService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this._onAddExtensions = this._register(( new Emitter()));
        this.onAddExtensions = this._onAddExtensions.event;
        this._onDidAddExtensions = this._register(( new Emitter()));
        this.onDidAddExtensions = this._onDidAddExtensions.event;
        this._onRemoveExtensions = this._register(( new Emitter()));
        this.onRemoveExtensions = this._onRemoveExtensions.event;
        this._onDidRemoveExtensions = this._register(( new Emitter()));
        this.onDidRemoveExtensions = this._onDidRemoveExtensions.event;
        this.resourcesAccessQueueMap = ( new ResourceMap());
    }
    scanProfileExtensions(profileLocation, options) {
        return this.withProfileExtensions(profileLocation, undefined, options);
    }
    async addExtensionsToProfile(extensions, profileLocation, keepExistingVersions) {
        const extensionsToRemove = [];
        const extensionsToAdd = [];
        try {
            await this.withProfileExtensions(profileLocation, existingExtensions => {
                const result = [];
                if (keepExistingVersions) {
                    result.push(...existingExtensions);
                } else {
                    for (const existing of existingExtensions) {
                        if (( extensions.some(
                            ([e]) => areSameExtensions(e.identifier, existing.identifier) && e.manifest.version !== existing.version
                        ))) {
                            extensionsToRemove.push(existing);
                        } else {
                            result.push(existing);
                        }
                    }
                }
                for (const [extension, metadata] of extensions) {
                    const index = result.findIndex(
                        e => areSameExtensions(e.identifier, extension.identifier) && e.version === extension.manifest.version
                    );
                    const extensionToAdd = {
                        identifier: extension.identifier,
                        version: extension.manifest.version,
                        location: extension.location,
                        metadata
                    };
                    if (index === -1) {
                        extensionsToAdd.push(extensionToAdd);
                        result.push(extensionToAdd);
                    } else {
                        result.splice(index, 1, extensionToAdd);
                    }
                }
                if (extensionsToAdd.length) {
                    this._onAddExtensions.fire({
                        extensions: extensionsToAdd,
                        profileLocation
                    });
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({
                        extensions: extensionsToRemove,
                        profileLocation
                    });
                }
                return result;
            });
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({
                    extensions: extensionsToAdd,
                    profileLocation
                });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({
                    extensions: extensionsToRemove,
                    profileLocation
                });
            }
            return extensionsToAdd;
        } catch (error) {
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({
                    extensions: extensionsToAdd,
                    error,
                    profileLocation
                });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({
                    extensions: extensionsToRemove,
                    error,
                    profileLocation
                });
            }
            throw error;
        }
    }
    async updateMetadata(extensions, profileLocation) {
        const updatedExtensions = [];
        await this.withProfileExtensions(profileLocation, profileExtensions => {
            const result = [];
            for (const profileExtension of profileExtensions) {
                const extension = extensions.find(([e]) => areSameExtensions({
                    id: e.identifier.id
                }, {
                    id: profileExtension.identifier.id
                }) && e.manifest.version === profileExtension.version);
                if (extension) {
                    profileExtension.metadata = {
                        ...profileExtension.metadata,
                        ...extension[1]
                    };
                    updatedExtensions.push(profileExtension);
                    result.push(profileExtension);
                } else {
                    result.push(profileExtension);
                }
            }
            return result;
        });
        return updatedExtensions;
    }
    async removeExtensionsFromProfile(extensions, profileLocation) {
        const extensionsToRemove = [];
        try {
            await this.withProfileExtensions(profileLocation, profileExtensions => {
                const result = [];
                for (const e of profileExtensions) {
                    if (( extensions.some(extension => areSameExtensions(e.identifier, extension)))) {
                        extensionsToRemove.push(e);
                    } else {
                        result.push(e);
                    }
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({
                        extensions: extensionsToRemove,
                        profileLocation
                    });
                }
                return result;
            });
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({
                    extensions: extensionsToRemove,
                    profileLocation
                });
            }
        } catch (error) {
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({
                    extensions: extensionsToRemove,
                    error,
                    profileLocation
                });
            }
            throw error;
        }
    }
    async withProfileExtensions(file, updateFn, options) {
        return this.getResourceAccessQueue(file).queue(async () => {
            let extensions = [];
            let storedProfileExtensions;
            try {
                const content = await this.fileService.readFile(file);
                storedProfileExtensions = JSON.parse(( content.value.toString()).trim() || "[]");
            } catch (error) {
                if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
                    throw error;
                }
                if (this.uriIdentityService.extUri.isEqual(file, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                    storedProfileExtensions = await this.migrateFromOldDefaultProfileExtensionsLocation();
                }
                if (!storedProfileExtensions && options?.bailOutWhenFileNotFound) {
                    throw ( new ExtensionsProfileScanningError(
                        getErrorMessage(error),
                        ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND
                    ));
                }
            }
            if (storedProfileExtensions) {
                if (!Array.isArray(storedProfileExtensions)) {
                    this.throwInvalidConentError(file);
                }
                let migrate = false;
                for (const e of storedProfileExtensions) {
                    if (!isStoredProfileExtension(e)) {
                        this.throwInvalidConentError(file);
                    }
                    let location;
                    if (isString(e.relativeLocation) && e.relativeLocation) {
                        location = this.resolveExtensionLocation(e.relativeLocation);
                    } else if (isString(e.location)) {
                        this.logService.warn(
                            `Extensions profile: Ignoring extension with invalid location: ${e.location}`
                        );
                        continue;
                    } else {
                        location = URI.revive(e.location);
                        const relativePath = this.toRelativePath(location);
                        if (relativePath) {
                            migrate = true;
                            e.relativeLocation = relativePath;
                        }
                    }
                    if (isUndefined(e.metadata?.hasPreReleaseVersion) && e.metadata?.preRelease) {
                        migrate = true;
                        e.metadata.hasPreReleaseVersion = true;
                    }
                    const uuid = e.metadata?.id ?? e.identifier.uuid;
                    extensions.push({
                        identifier: uuid ? {
                            id: e.identifier.id,
                            uuid
                        } : {
                            id: e.identifier.id
                        },
                        location,
                        version: e.version,
                        metadata: e.metadata
                    });
                }
                if (migrate) {
                    await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
                }
            }
            if (updateFn) {
                extensions = updateFn(extensions);
                const storedProfileExtensions = ( extensions.map(e => ({
                    identifier: e.identifier,
                    version: e.version,
                    location: e.location.toJSON(),
                    relativeLocation: this.toRelativePath(e.location),
                    metadata: e.metadata
                })));
                await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
            }
            return extensions;
        });
    }
    throwInvalidConentError(file) {
        throw ( new ExtensionsProfileScanningError(`Invalid extensions content in ${( file.toString())}`, ExtensionsProfileScanningErrorCode.ERROR_INVALID_CONTENT));
    }
    toRelativePath(extensionLocation) {
        return this.uriIdentityService.extUri.isEqual(
            this.uriIdentityService.extUri.dirname(extensionLocation),
            this.extensionsLocation
        ) ? this.uriIdentityService.extUri.basename(extensionLocation) : undefined;
    }
    resolveExtensionLocation(path) {
        return this.uriIdentityService.extUri.joinPath(this.extensionsLocation, path);
    }
    async migrateFromOldDefaultProfileExtensionsLocation() {
        if (!this._migrationPromise) {
            this._migrationPromise = (async () => {
                const oldDefaultProfileExtensionsLocation = this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.location, "extensions.json");
                const oldDefaultProfileExtensionsInitLocation = this.uriIdentityService.extUri.joinPath(this.extensionsLocation, ".init-default-profile-extensions");
                let content;
                try {
                    content = ( (await this.fileService.readFile(oldDefaultProfileExtensionsLocation)).value.toString());
                } catch (error) {
                    if (toFileOperationResult(error) === FileOperationResult.FILE_NOT_FOUND) {
                        return undefined;
                    }
                    throw error;
                }
                this.logService.info("Migrating extensions from old default profile location", ( oldDefaultProfileExtensionsLocation.toString()));
                let storedProfileExtensions;
                try {
                    const parsedData = JSON.parse(content);
                    if (Array.isArray(parsedData) && parsedData.every(candidate => isStoredProfileExtension(candidate))) {
                        storedProfileExtensions = parsedData;
                    } else {
                        this.logService.warn(
                            "Skipping migrating from old default profile locaiton: Found invalid data",
                            parsedData
                        );
                    }
                } catch (error) {
                    this.logService.error(error);
                }
                if (storedProfileExtensions) {
                    try {
                        await this.fileService.createFile(
                            this.userDataProfilesService.defaultProfile.extensionsResource,
                            VSBuffer.fromString(JSON.stringify(storedProfileExtensions)),
                            {
                                overwrite: false
                            }
                        );
                        this.logService.info(
                            "Migrated extensions from old default profile location to new location",
                            ( oldDefaultProfileExtensionsLocation.toString()),
                            ( this.userDataProfilesService.defaultProfile.extensionsResource.toString())
                        );
                    } catch (error) {
                        if (toFileOperationResult(error) === FileOperationResult.FILE_MODIFIED_SINCE) {
                            this.logService.info(
                                "Migration from old default profile location to new location is done by another window",
                                ( oldDefaultProfileExtensionsLocation.toString()),
                                ( this.userDataProfilesService.defaultProfile.extensionsResource.toString())
                            );
                        } else {
                            throw error;
                        }
                    }
                }
                try {
                    await this.fileService.del(oldDefaultProfileExtensionsLocation);
                } catch (error) {
                    if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
                        this.logService.error(error);
                    }
                }
                try {
                    await this.fileService.del(oldDefaultProfileExtensionsInitLocation);
                } catch (error) {
                    if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
                        this.logService.error(error);
                    }
                }
                return storedProfileExtensions;
            })();
        }
        return this._migrationPromise;
    }
    getResourceAccessQueue(file) {
        let resourceQueue = this.resourcesAccessQueueMap.get(file);
        if (!resourceQueue) {
            resourceQueue = ( new Queue());
            this.resourcesAccessQueueMap.set(file, resourceQueue);
        }
        return resourceQueue;
    }
};
AbstractExtensionsProfileScannerService = ( __decorate([( __param(1, IFileService)), ( __param(2, IUserDataProfilesService)), ( __param(3, IUriIdentityService)), ( __param(4, ILogService))], AbstractExtensionsProfileScannerService));
function isStoredProfileExtension(obj) {
    const candidate = obj;
    return isObject(candidate) && isIExtensionIdentifier(candidate.identifier) && (isUriComponents(candidate.location) || (isString(candidate.location) && !!candidate.location)) && (isUndefined(candidate.relativeLocation) || isString(candidate.relativeLocation)) && !!candidate.version && isString(candidate.version);
}
function isUriComponents(obj) {
    if (!obj) {
        return false;
    }
    const thing = obj;
    return typeof thing?.path === "string" && typeof thing?.scheme === "string";
}

export { AbstractExtensionsProfileScannerService, ExtensionsProfileScanningError, ExtensionsProfileScanningErrorCode };
