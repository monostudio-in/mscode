import { Event } from "../../../base/common/event.js";
import { ICommandEvent } from "./commands.js";
export declare const ICommandService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ICommandService>;
export interface ICommandService {
    readonly _serviceBrand: undefined;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    executeCommand<R = unknown>(commandId: string, ...args: unknown[]): Promise<R | undefined>;
}
