
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { IConfigurationService } from '../../configuration/common/configuration.service.js';
import { IEnvironmentService } from '../../environment/common/environment.service.js';
import { IFileService } from '../../files/common/files.service.js';
import { IStorageService } from '../../storage/common/storage.service.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.service.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.service.js';
import { AbstractFileSynchroniser } from './abstractSynchronizer.js';
import { USER_DATA_SYNC_SCHEME, Change } from './userDataSync.js';
import { IUserDataSyncStoreService, IUserDataSyncLocalStoreService, IUserDataSyncEnablementService, IUserDataSyncLogService } from './userDataSync.service.js';

let AbstractJsonSynchronizer = class AbstractJsonSynchronizer extends AbstractFileSynchroniser {
    constructor(
        fileResource,
        syncResourceMetadata,
        collection,
        previewFileName,
        fileService,
        environmentService,
        storageService,
        userDataSyncStoreService,
        userDataSyncLocalStoreService,
        userDataSyncEnablementService,
        telemetryService,
        logService,
        configurationService,
        uriIdentityService
    ) {
        super(
            fileResource,
            syncResourceMetadata,
            collection,
            fileService,
            environmentService,
            storageService,
            userDataSyncStoreService,
            userDataSyncLocalStoreService,
            userDataSyncEnablementService,
            telemetryService,
            logService,
            configurationService,
            uriIdentityService
        );
        this.version = 1;
        this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, previewFileName);
        this.baseResource = this.previewResource.with({
            scheme: USER_DATA_SYNC_SCHEME,
            authority: "base"
        });
        this.localResource = this.previewResource.with({
            scheme: USER_DATA_SYNC_SCHEME,
            authority: "local"
        });
        this.remoteResource = this.previewResource.with({
            scheme: USER_DATA_SYNC_SCHEME,
            authority: "remote"
        });
        this.acceptedResource = this.previewResource.with({
            scheme: USER_DATA_SYNC_SCHEME,
            authority: "accepted"
        });
    }
    async generateSyncPreview(
        remoteUserData,
        lastSyncUserData,
        isRemoteDataFromCurrentMachine,
        userDataSyncConfiguration
    ) {
        const remoteContent = remoteUserData.syncData ? this.getContentFromSyncContent(remoteUserData.syncData.content) : null;
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
        const fileContent = await this.getLocalFileContent();
        let content = null;
        let hasLocalChanged = false;
        let hasRemoteChanged = false;
        let hasConflicts = false;
        if (remoteUserData.syncData) {
            const localContent = fileContent ? ( fileContent.value.toString()) : null;
            if (
            !lastSyncContent || lastSyncContent !== localContent || lastSyncContent !== remoteContent) {
                this.logService.trace(
                    `${this.syncResourceLogLabel}: Merging remote ${this.syncResource.syncResource} with local ${this.syncResource.syncResource}...`
                );
                const result = this.merge(localContent, remoteContent, lastSyncContent);
                content = result.content;
                hasConflicts = result.hasConflicts;
                hasLocalChanged = result.hasLocalChanged;
                hasRemoteChanged = result.hasRemoteChanged;
            }
        }
        else if (fileContent) {
            this.logService.trace(
                `${this.syncResourceLogLabel}: Remote ${this.syncResource.syncResource} does not exist. Synchronizing ${this.syncResource.syncResource} for the first time.`
            );
            content = ( fileContent.value.toString());
            hasRemoteChanged = true;
        }
        const previewResult = {
            content: hasConflicts ? lastSyncContent : content,
            localChange: hasLocalChanged ? fileContent ? Change.Modified : Change.Added : Change.None,
            remoteChange: hasRemoteChanged ? Change.Modified : Change.None,
            hasConflicts
        };
        const localContent = fileContent ? ( fileContent.value.toString()) : null;
        return [{
            fileContent,
            baseResource: this.baseResource,
            baseContent: lastSyncContent,
            localResource: this.localResource,
            localContent,
            localChange: previewResult.localChange,
            remoteResource: this.remoteResource,
            remoteContent,
            remoteChange: previewResult.remoteChange,
            previewResource: this.previewResource,
            previewResult,
            acceptedResource: this.acceptedResource
        }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
        if (lastSyncContent === null) {
            return true;
        }
        const fileContent = await this.getLocalFileContent();
        const localContent = fileContent ? ( fileContent.value.toString()) : null;
        const result = this.merge(localContent, lastSyncContent, lastSyncContent);
        return result.hasLocalChanged || result.hasRemoteChanged;
    }
    async getMergeResult(resourcePreview, token) {
        return resourcePreview.previewResult;
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        if (this.extUri.isEqual(resource, this.localResource)) {
            return {
                content: resourcePreview.fileContent ? ( resourcePreview.fileContent.value.toString()) : null,
                localChange: Change.None,
                remoteChange: Change.Modified
            };
        }
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return {
                content: resourcePreview.remoteContent,
                localChange: Change.Modified,
                remoteChange: Change.None
            };
        }
        if (this.extUri.isEqual(resource, this.previewResource)) {
            if (content === undefined) {
                return {
                    content: resourcePreview.previewResult.content,
                    localChange: resourcePreview.previewResult.localChange,
                    remoteChange: resourcePreview.previewResult.remoteChange
                };
            } else {
                return {
                    content,
                    localChange: Change.Modified,
                    remoteChange: Change.Modified
                };
            }
        }
        throw ( new Error(`Invalid Resource: ${( resource.toString())}`));
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        const {
            fileContent
        } = resourcePreviews[0][0];
        const {
            content,
            localChange,
            remoteChange
        } = resourcePreviews[0][1];
        if (localChange === Change.None && remoteChange === Change.None) {
            this.logService.info(
                `${this.syncResourceLogLabel}: No changes found during synchronizing ${this.syncResource.syncResource}.`
            );
        }
        if (localChange !== Change.None) {
            this.logService.trace(
                `${this.syncResourceLogLabel}: Updating local ${this.syncResource.syncResource}...`
            );
            if (fileContent) {
                await this.backupLocal(JSON.stringify(this.toSyncContent(( fileContent.value.toString()))));
            }
            if (content) {
                await this.updateLocalFileContent(content, fileContent, force);
            } else {
                await this.deleteLocalFile();
            }
            this.logService.info(
                `${this.syncResourceLogLabel}: Updated local ${this.syncResource.syncResource}`
            );
        }
        if (remoteChange !== Change.None) {
            this.logService.trace(
                `${this.syncResourceLogLabel}: Updating remote ${this.syncResource.syncResource}...`
            );
            const remoteContents = JSON.stringify(this.toSyncContent(content));
            remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
            this.logService.info(
                `${this.syncResourceLogLabel}: Updated remote ${this.syncResource.syncResource}`
            );
        }
        try {
            await this.fileService.del(this.previewResource);
        } catch (e) {}
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(
                `${this.syncResourceLogLabel}: Updating last synchronized ${this.syncResource.syncResource}...`
            );
            await this.updateLastSyncUserData(remoteUserData);
            this.logService.info(
                `${this.syncResourceLogLabel}: Updated last synchronized ${this.syncResource.syncResource}`
            );
        }
    }
    async hasLocalData() {
        return this.fileService.exists(this.file);
    }
    async resolveContent(uri) {
        if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
            return this.resolvePreviewContent(uri);
        }
        return null;
    }
    merge(originalLocalContent, originalRemoteContent, baseContent) {
        if (originalLocalContent === null && originalRemoteContent === null && baseContent === null) {
            return {
                content: null,
                hasLocalChanged: false,
                hasRemoteChanged: false,
                hasConflicts: false
            };
        }
        originalRemoteContent = originalRemoteContent ?? "";
        originalLocalContent = originalLocalContent ?? "";
        baseContent = baseContent ?? "";
        if (originalLocalContent === originalRemoteContent) {
            return {
                content: null,
                hasLocalChanged: false,
                hasRemoteChanged: false,
                hasConflicts: false
            };
        }
        const localForwarded = baseContent !== originalLocalContent;
        const remoteForwarded = baseContent !== originalRemoteContent;
        if (!localForwarded && !remoteForwarded) {
            return {
                content: null,
                hasLocalChanged: false,
                hasRemoteChanged: false,
                hasConflicts: false
            };
        }
        if (localForwarded && !remoteForwarded) {
            return {
                content: originalLocalContent,
                hasRemoteChanged: true,
                hasLocalChanged: false,
                hasConflicts: false
            };
        }
        if (remoteForwarded && !localForwarded) {
            return {
                content: originalRemoteContent,
                hasLocalChanged: true,
                hasRemoteChanged: false,
                hasConflicts: false
            };
        }
        return {
            content: originalLocalContent,
            hasLocalChanged: true,
            hasRemoteChanged: true,
            hasConflicts: true
        };
    }
};
AbstractJsonSynchronizer = ( __decorate([( __param(4, IFileService)), ( __param(5, IEnvironmentService)), ( __param(6, IStorageService)), ( __param(7, IUserDataSyncStoreService)), ( __param(8, IUserDataSyncLocalStoreService)), ( __param(9, IUserDataSyncEnablementService)), ( __param(10, ITelemetryService)), ( __param(11, IUserDataSyncLogService)), ( __param(12, IConfigurationService)), ( __param(13, IUriIdentityService))], AbstractJsonSynchronizer));

export { AbstractJsonSynchronizer };
