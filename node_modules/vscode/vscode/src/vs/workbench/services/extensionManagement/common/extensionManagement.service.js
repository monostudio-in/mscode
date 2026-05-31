
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.service.js';
import { refineServiceDecorator, createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IProfileAwareExtensionManagementService = refineServiceDecorator(IExtensionManagementService);
const IExtensionManagementServerService = ( createDecorator("extensionManagementServerService"));
const IWorkbenchExtensionManagementService = refineServiceDecorator(IProfileAwareExtensionManagementService);
const IWorkbenchExtensionEnablementService = ( createDecorator("extensionEnablementService"));
const IWebExtensionsScannerService = ( createDecorator("IWebExtensionsScannerService"));

export { IExtensionManagementServerService, IProfileAwareExtensionManagementService, IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService };
