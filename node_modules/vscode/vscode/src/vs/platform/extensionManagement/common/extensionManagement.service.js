
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IExtensionGalleryService = ( createDecorator("extensionGalleryService"));
const IExtensionManagementService = ( createDecorator("extensionManagementService"));
const IGlobalExtensionEnablementService = ( createDecorator("IGlobalExtensionEnablementService"));
const IExtensionTipsService = ( createDecorator("IExtensionTipsService"));
const IAllowedExtensionsService = ( createDecorator("IAllowedExtensionsService"));

export { IAllowedExtensionsService, IExtensionGalleryService, IExtensionManagementService, IExtensionTipsService, IGlobalExtensionEnablementService };
