
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IWorkbenchConfigurationService = refineServiceDecorator(IConfigurationService);

export { IWorkbenchConfigurationService };
