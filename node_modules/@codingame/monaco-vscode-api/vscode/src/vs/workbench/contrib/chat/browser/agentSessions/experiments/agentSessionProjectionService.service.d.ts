import { Event } from "../../../../../../base/common/event.js";
import { IAgentSession } from "../agentSessionsModel.js";
export interface IAgentSessionProjectionService {
    readonly _serviceBrand: undefined;
    /**
    * Whether projection mode is active.
    */
    readonly isActive: boolean;
    /**
    * The currently active session in projection mode, if any.
    */
    readonly activeSession: IAgentSession | undefined;
    /**
    * Event fired when projection mode changes.
    */
    readonly onDidChangeProjectionMode: Event<boolean>;
    /**
    * Event fired when the active session changes (including when switching between sessions).
    */
    readonly onDidChangeActiveSession: Event<IAgentSession | undefined>;
    /**
    * Enter projection mode for the given session.
    */
    enterProjection(session: IAgentSession): Promise<void>;
    /**
    * Exit projection mode.
    * @param options.startNewChat If true (default), starts a new chat after exiting. Set to false to keep the current chat open.
    */
    exitProjection(options?: {
        startNewChat?: boolean;
    }): Promise<void>;
}
export declare const IAgentSessionProjectionService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentSessionProjectionService>;
