
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IAuthenticationService = ( createDecorator("IAuthenticationService"));
const IAuthenticationExtensionsService = ( createDecorator("IAuthenticationExtensionsService"));

export { IAuthenticationExtensionsService, IAuthenticationService };
