
import { IEnvironmentService } from '../../../../platform/environment/common/environment.service.js';
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IBrowserWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);

export { IBrowserWorkbenchEnvironmentService };
