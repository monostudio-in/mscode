import { Event } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IPartialCommandDetectionCapability, TerminalCapability } from "./capabilities.js";
import type { IMarker, Terminal } from "@xterm/headless";
/**
 * This capability guesses where commands are based on where the cursor was when enter was pressed.
 * It's very hit or miss but it's often correct and better than nothing.
 */
export declare class PartialCommandDetectionCapability extends DisposableStore implements IPartialCommandDetectionCapability {
    private readonly _terminal;
    private _onDidExecuteText;
    readonly type = TerminalCapability.PartialCommandDetection;
    private readonly _commands;
    get commands(): readonly IMarker[];
    private readonly _onCommandFinished;
    readonly onCommandFinished: Event<IMarker>;
    constructor(_terminal: Terminal, _onDidExecuteText: Event<void> | undefined);
    private _onData;
    private _onEnter;
    private _clearCommandsInViewport;
}
