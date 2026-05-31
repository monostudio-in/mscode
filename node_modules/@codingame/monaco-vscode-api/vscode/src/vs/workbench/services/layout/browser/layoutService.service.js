
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.service.js';

const IWorkbenchLayoutService = refineServiceDecorator(ILayoutService);

export { IWorkbenchLayoutService };
