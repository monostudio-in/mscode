import { Event } from "../../../base/common/event.js";
import * as performance from "../../../base/common/performance.js";
import { IProcessEnvironment, OperatingSystem } from "../../../base/common/platform.js";
import { ILogService } from "../../log/common/log.service.js";
import { IPtyHostProcessReplayEvent } from "./capabilities/capabilities.js";
import { IProcessDataEvent, IProcessReadyEvent, IProcessProperty, IShellLaunchConfig, ITerminalProcessOptions, IPtyHostLatencyMeasurement, ITerminalLaunchError, ITerminalLaunchResult, TitleEventSource, TerminalIcon, ITerminalsLayoutInfo, ISerializedTerminalState, ProcessPropertyType, IProcessPropertyMap, type IPtyHostService } from "./terminal.js";
import { IProcessDetails, ISetTerminalLayoutInfoArgs, IGetTerminalLayoutInfoArgs } from "./terminalProcess.js";
/**
* A service that communicates with a pty host.
*/
export interface IPtyService {
    readonly _serviceBrand: undefined;
    readonly onProcessData: Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    readonly onProcessReady: Event<{
        id: number;
        event: IProcessReadyEvent;
    }>;
    readonly onProcessReplay: Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    readonly onProcessOrphanQuestion: Event<{
        id: number;
    }>;
    readonly onDidRequestDetach: Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    readonly onDidChangeProperty: Event<{
        id: number;
        property: IProcessProperty;
    }>;
    readonly onProcessExit: Event<{
        id: number;
        event: number | undefined;
    }>;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: "6" | "11", env: IProcessEnvironment, executableEnv: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean, workspaceId: string, workspaceName: string): Promise<number>;
    attachToProcess(id: number): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    shutdownAll(): Promise<void>;
    /**
    * Lists all orphaned processes, ie. those without a connected frontend.
    */
    listProcesses(): Promise<IProcessDetails[]>;
    getPerformanceMarks(): Promise<performance.PerformanceMark[]>;
    /**
    * Measures and returns the latency of the current and all other processes to the pty host.
    */
    getLatency(): Promise<IPtyHostLatencyMeasurement[]>;
    start(id: number): Promise<ITerminalLaunchError | ITerminalLaunchResult | undefined>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    input(id: number, data: string): Promise<void>;
    sendSignal(id: number, signal: string): Promise<void>;
    resize(id: number, cols: number, rows: number, pixelWidth?: number, pixelHeight?: number): Promise<void>;
    clearBuffer(id: number): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setNextCommandId(id: number, commandLine: string, commandId: string): Promise<void>;
    setUnicodeVersion(id: number, version: "6" | "11"): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    /** Confirm the process is _not_ an orphan. */
    orphanQuestionReply(id: number): Promise<void>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string, direction: "unix-to-win" | "win-to-unix"): Promise<string>;
    getRevivedPtyNewId(workspaceId: string, id: number): Promise<number | undefined>;
    setTerminalLayoutInfo(args: ISetTerminalLayoutInfoArgs): Promise<void>;
    getTerminalLayoutInfo(args: IGetTerminalLayoutInfoArgs): Promise<ITerminalsLayoutInfo | undefined>;
    reduceConnectionGraceTime(): Promise<void>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId?: number): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    /**
    * Serializes and returns terminal state.
    * @param ids The persistent terminal IDs to serialize.
    */
    serializeTerminalState(ids: number[]): Promise<string>;
    /**
    * Revives a workspaces terminal processes, these can then be reconnected to using the normal
    * flow for restoring terminals after reloading.
    */
    reviveTerminalProcesses(workspaceId: string, state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(id: number, property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, property: T, value: IProcessPropertyMap[T]): Promise<void>;
    refreshIgnoreProcessNames?(names: string[]): Promise<void>;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
}
export declare const IPtyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IPtyService>;
export declare const ILocalPtyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILocalPtyService>;
/**
* A service responsible for communicating with the pty host process on Electron.
*
* **This service should only be used within the terminal component.**
*/
export interface ILocalPtyService extends IPtyHostService {
}
export declare const ITerminalLogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ITerminalLogService>;
export interface ITerminalLogService extends ILogService {
    /**
    * Similar to _serviceBrand but used to differentiate this service at compile time from
    * ILogService; ITerminalLogService is an ILogService, but ILogService is not an
    * ITerminalLogService.
    */
    readonly _logBrand: undefined;
}
