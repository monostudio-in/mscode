
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IMcpService = ( createDecorator("IMcpService"));
const IMcpWorkbenchService = ( createDecorator("IMcpWorkbenchService"));
const IMcpSamplingService = ( createDecorator("IMcpServerSampling"));
const IMcpElicitationService = ( createDecorator("IMcpElicitationService"));

export { IMcpElicitationService, IMcpSamplingService, IMcpService, IMcpWorkbenchService };
