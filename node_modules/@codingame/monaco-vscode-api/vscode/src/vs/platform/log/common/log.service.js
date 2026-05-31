
import { createDecorator } from '../../instantiation/common/instantiation.js';

const ILogService = ( createDecorator("logService"));
const ILoggerService = ( createDecorator("loggerService"));

export { ILogService, ILoggerService };
