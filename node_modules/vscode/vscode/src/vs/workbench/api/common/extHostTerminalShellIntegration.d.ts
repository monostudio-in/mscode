import type * as vscode from "vscode";
import { TerminalShellExecutionCommandLineConfidence } from "./extHostTypes.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { type ExtHostTerminalShellIntegrationShape, type MainThreadTerminalShellIntegrationShape } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostTerminalService } from "./extHostTerminalService.js";
import { Emitter, type Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
export interface IExtHostTerminalShellIntegration extends ExtHostTerminalShellIntegrationShape {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTerminalShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidStartTerminalShellExecution: Event<vscode.TerminalShellExecutionStartEvent>;
    readonly onDidEndTerminalShellExecution: Event<vscode.TerminalShellExecutionEndEvent>;
}
export declare const IExtHostTerminalShellIntegration: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTerminalShellIntegration>;
export declare class ExtHostTerminalShellIntegration extends Disposable implements IExtHostTerminalShellIntegration {
    private readonly _extHostTerminalService;
    readonly _serviceBrand: undefined;
    protected _proxy: MainThreadTerminalShellIntegrationShape;
    private _activeShellIntegrations;
    protected readonly _onDidChangeTerminalShellIntegration: Emitter<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidChangeTerminalShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    protected readonly _onDidStartTerminalShellExecution: Emitter<vscode.TerminalShellExecutionStartEvent>;
    readonly onDidStartTerminalShellExecution: Event<vscode.TerminalShellExecutionStartEvent>;
    protected readonly _onDidEndTerminalShellExecution: Emitter<vscode.TerminalShellExecutionEndEvent>;
    readonly onDidEndTerminalShellExecution: Event<vscode.TerminalShellExecutionEndEvent>;
    constructor(extHostRpc: IExtHostRpcService, _extHostTerminalService: IExtHostTerminalService);
    $shellIntegrationChange(instanceId: number, supportsExecuteCommandApi: boolean): void;
    $shellExecutionStart(instanceId: number, supportsExecuteCommandApi: boolean, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, cwd: string | undefined): void;
    $shellExecutionEnd(instanceId: number, commandLineValue: string, commandLineConfidence: TerminalShellExecutionCommandLineConfidence, isTrusted: boolean, exitCode: number | undefined): void;
    $shellExecutionData(instanceId: number, data: string): void;
    $shellEnvChange(instanceId: number, shellEnvKeys: string[], shellEnvValues: string[], isTrusted: boolean): void;
    $cwdChange(instanceId: number, cwd: string | undefined): void;
    $closeTerminal(instanceId: number): void;
    private _convertCwdToUri;
}
export declare class InternalTerminalShellIntegration extends Disposable {
    private readonly _terminal;
    private readonly _onDidStartTerminalShellExecution;
    private _pendingExecutions;
    private _pendingEndingExecution;
    private _currentExecutionProperties;
    private _currentExecution;
    get currentExecution(): InternalTerminalShellExecution | undefined;
    private _env;
    private _cwd;
    readonly store: DisposableStore;
    readonly value: vscode.TerminalShellIntegration;
    protected readonly _onDidRequestChangeShellIntegration: Emitter<vscode.TerminalShellIntegrationChangeEvent>;
    readonly onDidRequestChangeShellIntegration: Event<vscode.TerminalShellIntegrationChangeEvent>;
    protected readonly _onDidRequestShellExecution: Emitter<string>;
    readonly onDidRequestShellExecution: Event<string>;
    protected readonly _onDidRequestEndExecution: Emitter<vscode.TerminalShellExecutionEndEvent>;
    readonly onDidRequestEndExecution: Event<vscode.TerminalShellExecutionEndEvent>;
    protected readonly _onDidRequestNewExecution: Emitter<string>;
    readonly onDidRequestNewExecution: Event<string>;
    constructor(_terminal: vscode.Terminal, supportsExecuteCommandApi: boolean, _onDidStartTerminalShellExecution: Emitter<vscode.TerminalShellExecutionStartEvent>);
    requestNewShellExecution(commandLine: vscode.TerminalShellExecutionCommandLine, cwd: URI | undefined): InternalTerminalShellExecution;
    startShellExecution(commandLine: vscode.TerminalShellExecutionCommandLine, cwd: URI | undefined): undefined;
    emitData(data: string): void;
    endShellExecution(commandLine: vscode.TerminalShellExecutionCommandLine | undefined, exitCode: number | undefined): void;
    setEnv(keys: string[], values: string[], isTrusted: boolean): void;
    setCwd(cwd: URI | undefined): void;
    private _fireChangeEvent;
}
declare class InternalTerminalShellExecution {
    private _commandLine;
    readonly cwd: URI | undefined;
    readonly value: vscode.TerminalShellExecution;
    private _dataStream;
    private _isEnded;
    constructor(_commandLine: vscode.TerminalShellExecutionCommandLine, cwd: URI | undefined);
    private _createDataStream;
    emitData(data: string): void;
    endExecution(commandLine: vscode.TerminalShellExecutionCommandLine | undefined): void;
    flush(): Promise<void>;
}
export {};
