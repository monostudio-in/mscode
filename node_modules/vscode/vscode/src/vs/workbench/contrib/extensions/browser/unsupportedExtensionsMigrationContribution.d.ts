import { IGlobalExtensionEnablementService } from "../../../../platform/extensionManagement/common/extensionManagement.service.js";
import { IExtensionGalleryService } from "../../../../platform/extensionManagement/common/extensionManagement.service.js";
import { IExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
export declare class UnsupportedExtensionsMigrationContrib implements IWorkbenchContribution {
    constructor(extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService);
}
