
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IMcpGalleryService = ( createDecorator("IMcpGalleryService"));
const IMcpManagementService = ( createDecorator("IMcpManagementService"));
const IAllowedMcpServersService = ( createDecorator("IAllowedMcpServersService"));

export { IAllowedMcpServersService, IMcpGalleryService, IMcpManagementService };
