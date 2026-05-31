
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IBrowserViewWorkbenchService = ( createDecorator("browserViewWorkbenchService"));
const IBrowserViewCDPService = ( createDecorator("browserViewCDPService"));

export { IBrowserViewCDPService, IBrowserViewWorkbenchService };
