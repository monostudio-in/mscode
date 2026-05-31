
import { createDecorator } from '../../../../../platform/instantiation/common/instantiation.js';

const IChatAgentService = ( createDecorator("chatAgentService"));
const IChatAgentNameService = ( createDecorator("chatAgentNameService"));

export { IChatAgentNameService, IChatAgentService };
