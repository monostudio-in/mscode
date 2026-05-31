
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { SIGN_SERVICE_ID } from './sign.js';

const ISignService = ( createDecorator(SIGN_SERVICE_ID));

export { ISignService };
