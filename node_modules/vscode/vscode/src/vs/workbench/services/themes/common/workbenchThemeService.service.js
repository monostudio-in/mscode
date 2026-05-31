
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';

const IWorkbenchThemeService = refineServiceDecorator(IThemeService);

export { IWorkbenchThemeService };
