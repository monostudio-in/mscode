
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IMcpManagementService } from '../../../../platform/mcp/common/mcpManagement.service.js';

const IWorkbenchMcpManagementService = refineServiceDecorator(IMcpManagementService);

export { IWorkbenchMcpManagementService };
