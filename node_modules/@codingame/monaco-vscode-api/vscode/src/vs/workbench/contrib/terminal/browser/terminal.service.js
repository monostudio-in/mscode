
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const ITerminalService = ( createDecorator("terminalService"));
const ITerminalConfigurationService = ( createDecorator("terminalConfigurationService"));
const ITerminalEditorService = ( createDecorator("terminalEditorService"));
const ITerminalEditingService = ( createDecorator("terminalEditingService"));
const ITerminalGroupService = ( createDecorator("terminalGroupService"));
const ITerminalInstanceService = ( createDecorator("terminalInstanceService"));
const ITerminalChatService = ( createDecorator("terminalChatService"));

export { ITerminalChatService, ITerminalConfigurationService, ITerminalEditingService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService };
