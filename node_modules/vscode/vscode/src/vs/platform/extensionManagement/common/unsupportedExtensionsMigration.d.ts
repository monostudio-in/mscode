import { IGlobalExtensionEnablementService } from "./extensionManagement.service.js";
import { IExtensionManagementService } from "./extensionManagement.service.js";
import { IExtensionGalleryService } from "./extensionManagement.service.js";
import { IExtensionStorageService } from "./extensionStorage.service.js";
import { ILogService } from "../../log/common/log.service.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
/**
 * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
 * 	- Uninstall the Unsupported extension
 * 	- Install (with optional storage migration) the Pre-release extension only if
 * 		- the extension is not installed
 * 		- or it is a release version and the unsupported extension is enabled.
 */
export declare function migrateUnsupportedExtensions(profile: IUserDataProfile | undefined, extensionManagementService: IExtensionManagementService, galleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService): Promise<void>;
