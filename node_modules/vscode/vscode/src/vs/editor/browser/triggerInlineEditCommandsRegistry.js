

class TriggerInlineEditCommandsRegistry {
    static {
        this.REGISTERED_COMMANDS = ( new Set());
    }
    static getRegisteredCommands() {
        return [...TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS];
    }
    static registerCommand(commandId) {
        TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS.add(commandId);
    }
}

export { TriggerInlineEditCommandsRegistry };
