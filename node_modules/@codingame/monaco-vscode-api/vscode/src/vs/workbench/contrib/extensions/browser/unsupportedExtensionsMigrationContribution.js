
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.service.js';
import { IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.service.js';
import { migrateUnsupportedExtensions } from '../../../../platform/extensionManagement/common/unsupportedExtensionsMigration.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.service.js';

let UnsupportedExtensionsMigrationContrib = class UnsupportedExtensionsMigrationContrib {
    constructor(
        extensionManagementServerService,
        extensionGalleryService,
        extensionStorageService,
        extensionEnablementService,
        logService
    ) {
        if (extensionManagementServerService.remoteExtensionManagementServer) {
            migrateUnsupportedExtensions(
                undefined,
                extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService,
                extensionGalleryService,
                extensionStorageService,
                extensionEnablementService,
                logService
            );
        }
        if (extensionManagementServerService.webExtensionManagementServer) {
            migrateUnsupportedExtensions(
                undefined,
                extensionManagementServerService.webExtensionManagementServer.extensionManagementService,
                extensionGalleryService,
                extensionStorageService,
                extensionEnablementService,
                logService
            );
        }
    }
};
UnsupportedExtensionsMigrationContrib = ( __decorate([( __param(0, IExtensionManagementServerService)), ( __param(1, IExtensionGalleryService)), ( __param(2, IExtensionStorageService)), ( __param(3, IGlobalExtensionEnablementService)), ( __param(4, ILogService))], UnsupportedExtensionsMigrationContrib));

export { UnsupportedExtensionsMigrationContrib };
