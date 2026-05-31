import { Event } from "../../../base/common/event.js";
import { IJSONSchema } from "../../../base/common/jsonSchema.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { TypeConstraint } from "../../../base/common/types.js";
import { ILocalizedString } from "../../action/common/action.js";
import { ServicesAccessor } from "../../instantiation/common/instantiation.js";
export interface ICommandEvent {
    readonly commandId: string;
    readonly args: unknown[];
}
export type ICommandsMap = Map<string, ICommand>;
export type ICommandHandler<Args extends unknown[] = unknown[], R = void> = (accessor: ServicesAccessor, ...args: Args) => R;
export interface ICommand<Args extends unknown[] = unknown[], R = void> {
    id: string;
    handler: ICommandHandler<Args, R>;
    metadata?: ICommandMetadata | null;
}
export interface ICommandMetadata {
    /**
     * NOTE: Please use an ILocalizedString. string is in the type for backcompat for now.
     * A short summary of what the command does. This will be used in:
     * - API commands
     * - when showing keybindings that have no other UX
     * - when searching for commands in the Command Palette
     */
    readonly description: ILocalizedString | string;
    readonly args?: ReadonlyArray<{
        readonly name: string;
        readonly isOptional?: boolean;
        readonly description?: string;
        readonly constraint?: TypeConstraint;
        readonly schema?: IJSONSchema;
    }>;
    readonly returns?: string;
}
export interface ICommandRegistry {
    readonly onDidRegisterCommand: Event<string>;
    registerCommand<Args extends unknown[]>(id: string, command: ICommandHandler<Args>): IDisposable;
    registerCommand<Args extends unknown[]>(command: ICommand<Args>): IDisposable;
    registerCommandAlias(oldId: string, newId: string): IDisposable;
    getCommand(id: string): ICommand | undefined;
    getCommands(): ICommandsMap;
}
export declare const CommandsRegistry: ICommandRegistry;
