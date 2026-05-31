
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IWorkspaceTrustEnablementService = ( createDecorator("workspaceTrustEnablementService"));
const IWorkspaceTrustManagementService = ( createDecorator("workspaceTrustManagementService"));
const IWorkspaceTrustRequestService = ( createDecorator("workspaceTrustRequestService"));

export { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService };
