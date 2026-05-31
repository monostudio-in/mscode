/**
 * Registry for commands that can trigger Inline Edits (NES) when invoked.
 */
export declare abstract class TriggerInlineEditCommandsRegistry {
    private static REGISTERED_COMMANDS;
    static getRegisteredCommands(): readonly string[];
    static registerCommand(commandId: string): void;
}
