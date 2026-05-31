
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IChatWidgetService = ( createDecorator("chatWidgetService"));
const IQuickChatService = ( createDecorator("quickChatService"));
const IChatAccessibilityService = ( createDecorator("chatAccessibilityService"));
const IChatCodeBlockContextProviderService = ( createDecorator("chatCodeBlockContextProviderService"));

export { IChatAccessibilityService, IChatCodeBlockContextProviderService, IChatWidgetService, IQuickChatService };
