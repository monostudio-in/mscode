import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../../base/common/uri.js";
import { IAgentTitleBarStatusService } from "./agentTitleBarStatusService.service.js";
export declare enum AgentStatusMode {
    /** Default mode showing workspace name + session stats */
    Default = "default",
    /** Session ready mode showing session title + Enter button (before entering projection) */
    SessionReady = "sessionReady",
    /** Session mode showing session title + Esc button (inside projection) */
    Session = "session"
}
export interface IAgentStatusSessionInfo {
    readonly sessionResource: URI;
    readonly title: string;
}
export declare class AgentTitleBarStatusService extends Disposable implements IAgentTitleBarStatusService {
    readonly _serviceBrand: undefined;
    private _mode;
    get mode(): AgentStatusMode;
    private _sessionInfo;
    get sessionInfo(): IAgentStatusSessionInfo | undefined;
    private readonly _onDidChangeMode;
    readonly onDidChangeMode: import("../../../../../../base/common/event.js").Event<AgentStatusMode>;
    private readonly _onDidChangeSessionInfo;
    readonly onDidChangeSessionInfo: import("../../../../../../base/common/event.js").Event<IAgentStatusSessionInfo | undefined>;
    enterSessionMode(sessionResource: URI, title: string): void;
    enterSessionReadyMode(sessionResource: URI, title: string): void;
    exitSessionReadyMode(): void;
    exitSessionMode(): void;
    updateSessionTitle(title: string): void;
}
