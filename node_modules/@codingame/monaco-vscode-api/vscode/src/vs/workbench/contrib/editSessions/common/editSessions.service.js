
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IEditSessionsStorageService = ( createDecorator("IEditSessionsStorageService"));
const IEditSessionsLogService = ( createDecorator("IEditSessionsLogService"));

export { IEditSessionsLogService, IEditSessionsStorageService };
