import { IDiagnosticInfoOptions, IDiagnosticInfo } from "../../../../platform/diagnostics/common/diagnostics.js";
import { IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import { TelemetryLevel, ITelemetryData } from "../../../../platform/telemetry/common/telemetry.js";
import { IRemoteAgentConnection, IExtensionHostExitInfo } from "@codingame/monaco-vscode-remote-agent-service-override/vscode/vs/workbench/services/remote/common/remoteAgentService";
export declare const IRemoteAgentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteAgentService>;
export interface IRemoteAgentService {
    readonly _serviceBrand: undefined;
    getConnection(): IRemoteAgentConnection | null;
    /**
    * Get the remote environment. In case of an error, returns `null`.
    */
    getEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    /**
    * Get the remote environment. Can return an error.
    */
    getRawEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    /**
    * Get exit information for a remote extension host.
    */
    getExtensionHostExitInfo(reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    /**
    * Gets the round trip time from the remote extension host. Note that this
    * may be delayed if the extension host is busy.
    */
    getRoundTripTime(): Promise<number | undefined>;
    /**
    * Gracefully ends the current connection, if any.
    */
    endConnection(): Promise<void>;
    getDiagnosticInfo(options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo | undefined>;
    updateTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
    logTelemetry(eventName: string, data?: ITelemetryData): Promise<void>;
    flushTelemetry(): Promise<void>;
}
