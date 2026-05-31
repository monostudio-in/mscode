import { Event } from "../../../../../../base/common/event.js";
import { URI } from "../../../../../../base/common/uri.js";
import { AgentStatusMode, IAgentStatusSessionInfo } from "./agentTitleBarStatusService.js";
export interface IAgentTitleBarStatusService {
    readonly _serviceBrand: undefined;
    /**
    * The current mode of the agent status widget.
    */
    readonly mode: AgentStatusMode;
    /**
    * The current session info when in session mode, undefined otherwise.
    */
    readonly sessionInfo: IAgentStatusSessionInfo | undefined;
    /**
    * Event fired when the control mode changes.
    */
    readonly onDidChangeMode: Event<AgentStatusMode>;
    /**
    * Event fired when the session info changes (including when entering/exiting session mode).
    */
    readonly onDidChangeSessionInfo: Event<IAgentStatusSessionInfo | undefined>;
    /**
    * Enter session mode, showing the session title and escape button.
    * Used by Agent Session Projection when entering a focused session view.
    */
    enterSessionMode(sessionResource: URI, title: string): void;
    /**
    * Enter session ready mode, showing the session title and enter button.
    * Used when viewing a projection-capable session that can be entered.
    */
    enterSessionReadyMode(sessionResource: URI, title: string): void;
    /**
    * Exit session ready mode, returning to the default mode.
    * Called when the session is no longer visible or valid for projection.
    */
    exitSessionReadyMode(): void;
    /**
    * Exit session mode, returning to the default mode with workspace name and stats.
    * Used by Agent Session Projection when exiting a focused session view.
    */
    exitSessionMode(): void;
    /**
    * Update the session title while in session mode.
    */
    updateSessionTitle(title: string): void;
}
export declare const IAgentTitleBarStatusService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentTitleBarStatusService>;
