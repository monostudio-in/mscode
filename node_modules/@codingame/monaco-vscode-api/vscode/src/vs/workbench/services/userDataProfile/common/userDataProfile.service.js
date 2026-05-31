
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IUserDataProfileService = ( createDecorator("IUserDataProfileService"));
const IUserDataProfileManagementService = ( createDecorator("IUserDataProfileManagementService"));
const IUserDataProfileImportExportService = ( createDecorator("IUserDataProfileImportExportService"));

export { IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService };
