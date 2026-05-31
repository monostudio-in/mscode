
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IConfigurationService } from '../../configuration/common/configuration.service.js';
import { IEnvironmentService } from '../../environment/common/environment.service.js';
import { IFileService } from '../../files/common/files.service.js';
import { IStorageService } from '../../storage/common/storage.service.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.service.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.service.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.service.js';
import { AbstractJsonSynchronizer } from './abstractJsonSynchronizer.js';
import { AbstractInitializer } from './abstractSynchronizer.js';
import { SyncResource } from './userDataSync.js';
import { IUserDataSyncStoreService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService } from './userDataSync.service.js';

function getTasksContentFromSyncContent(syncContent, logService) {
    try {
        const parsed = JSON.parse(syncContent);
        return parsed.tasks ?? null;
    } catch (e) {
        logService.error(e);
        return null;
    }
}
let TasksSynchroniser = class TasksSynchroniser extends AbstractJsonSynchronizer {
    constructor(
        profile,
        collection,
        userDataSyncStoreService,
        userDataSyncLocalStoreService,
        logService,
        configurationService,
        userDataSyncEnablementService,
        fileService,
        environmentService,
        storageService,
        telemetryService,
        uriIdentityService
    ) {
        super(profile.tasksResource, {
            syncResource: SyncResource.Tasks,
            profile
        }, collection, "tasks.json", fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    }
    getContentFromSyncContent(syncContent) {
        return getTasksContentFromSyncContent(syncContent, this.logService);
    }
    toSyncContent(tasks) {
        return tasks ? {
            tasks
        } : {};
    }
};
TasksSynchroniser = ( __decorate([( __param(2, IUserDataSyncStoreService)), ( __param(3, IUserDataSyncLocalStoreService)), ( __param(4, IUserDataSyncLogService)), ( __param(5, IConfigurationService)), ( __param(6, IUserDataSyncEnablementService)), ( __param(7, IFileService)), ( __param(8, IEnvironmentService)), ( __param(9, IStorageService)), ( __param(10, ITelemetryService)), ( __param(11, IUriIdentityService))], TasksSynchroniser));
let TasksInitializer = class TasksInitializer extends AbstractInitializer {
    constructor(
        fileService,
        userDataProfilesService,
        environmentService,
        logService,
        storageService,
        uriIdentityService
    ) {
        super(
            SyncResource.Tasks,
            userDataProfilesService,
            environmentService,
            logService,
            fileService,
            storageService,
            uriIdentityService
        );
        this.tasksResource = this.userDataProfilesService.defaultProfile.tasksResource;
    }
    async doInitialize(remoteUserData) {
        const tasksContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
        if (!tasksContent) {
            this.logService.info("Skipping initializing tasks because remote tasks does not exist.");
            return;
        }
        const isEmpty = await this.isEmpty();
        if (!isEmpty) {
            this.logService.info("Skipping initializing tasks because local tasks exist.");
            return;
        }
        await this.fileService.writeFile(this.tasksResource, VSBuffer.fromString(tasksContent));
        await this.updateLastSyncUserData(remoteUserData);
    }
    async isEmpty() {
        return this.fileService.exists(this.tasksResource);
    }
};
TasksInitializer = ( __decorate([( __param(0, IFileService)), ( __param(1, IUserDataProfilesService)), ( __param(2, IEnvironmentService)), ( __param(3, IUserDataSyncLogService)), ( __param(4, IStorageService)), ( __param(5, IUriIdentityService))], TasksInitializer));

export { TasksInitializer, TasksSynchroniser, getTasksContentFromSyncContent };
