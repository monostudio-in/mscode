import { Event } from "../../../../base/common/event.js";
import { URI as uri } from "../../../../base/common/uri.js";
import { ITextModel as EditorIModel } from "../../../../editor/common/model.js";
import { State, IDebugSessionOptions, IDebugSession, IConfigurationManager, IAdapterManager, IStackFrame, IThread, IBreakpointData, IBreakpoint, IBreakpointUpdateData, IEnablement, IExceptionBreakpoint, ILaunch, IConfig, IDebugModel, IViewModel } from "./debug.js";
import { IFunctionBreakpointOptions, IDataBreakpointOptions, IInstructionBreakpointOptions } from "./debugModel.js";
export declare const IDebugService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDebugService>;
export interface IDebugService {
    readonly _serviceBrand: undefined;
    /**
    * Gets the current debug state.
    */
    readonly state: State;
    readonly initializingOptions?: IDebugSessionOptions | undefined;
    /**
    * Allows to register on debug state changes.
    */
    readonly onDidChangeState: Event<State>;
    /**
    * Allows to register on sessions about to be created (not yet fully initialised).
    * This is fired exactly one time for any given session.
    */
    readonly onWillNewSession: Event<IDebugSession>;
    /**
    * Fired when a new debug session is started. This may fire multiple times
    * for a single session due to restarts.
    */
    readonly onDidNewSession: Event<IDebugSession>;
    /**
    * Allows to register on end session events.
    *
    * Contains a boolean indicating whether the session will restart. If restart
    * is true, the session should not considered to be dead yet.
    */
    readonly onDidEndSession: Event<{
        session: IDebugSession;
        restart: boolean;
    }>;
    /**
    * Gets the configuration manager.
    */
    getConfigurationManager(): IConfigurationManager;
    /**
    * Gets the adapter manager.
    */
    getAdapterManager(): IAdapterManager;
    /**
    * Sets the focused stack frame and evaluates all expressions against the newly focused stack frame,
    */
    focusStackFrame(focusedStackFrame: IStackFrame | undefined, thread?: IThread, session?: IDebugSession, options?: {
        explicit?: boolean;
        preserveFocus?: boolean;
        sideBySide?: boolean;
        pinned?: boolean;
    }): Promise<void>;
    /**
    * Returns true if breakpoints can be set for a given editor model. Depends on mode.
    */
    canSetBreakpointsIn(model: EditorIModel): boolean;
    /**
    * Adds new breakpoints to the model for the file specified with the uri. Notifies debug adapter of breakpoint changes.
    */
    addBreakpoints(uri: uri, rawBreakpoints: IBreakpointData[], ariaAnnounce?: boolean): Promise<IBreakpoint[]>;
    /**
    * Updates the breakpoints.
    */
    updateBreakpoints(originalUri: uri, data: Map<string, IBreakpointUpdateData>, sendOnResourceSaved: boolean): Promise<void>;
    /**
    * Enables or disables all breakpoints. If breakpoint is passed only enables or disables the passed breakpoint.
    * Notifies debug adapter of breakpoint changes.
    */
    enableOrDisableBreakpoints(enable: boolean, breakpoint?: IEnablement): Promise<void>;
    /**
    * Sets the global activated property for all breakpoints.
    * Notifies debug adapter of breakpoint changes.
    */
    setBreakpointsActivated(activated: boolean): Promise<void>;
    /**
    * Removes all breakpoints. If id is passed only removes the breakpoint associated with that id.
    * Notifies debug adapter of breakpoint changes.
    */
    removeBreakpoints(id?: string | string[]): Promise<void>;
    /**
    * Adds a new function breakpoint for the given name.
    */
    addFunctionBreakpoint(opts?: IFunctionBreakpointOptions, id?: string): void;
    /**
    * Updates an already existing function breakpoint.
    * Notifies debug adapter of breakpoint changes.
    */
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    /**
    * Removes all function breakpoints. If id is passed only removes the function breakpoint with the passed id.
    * Notifies debug adapter of breakpoint changes.
    */
    removeFunctionBreakpoints(id?: string): Promise<void>;
    /**
    * Adds a new data breakpoint.
    */
    addDataBreakpoint(opts: IDataBreakpointOptions): Promise<void>;
    /**
    * Updates an already existing data breakpoint.
    * Notifies debug adapter of breakpoint changes.
    */
    updateDataBreakpoint(id: string, update: {
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    /**
    * Removes all data breakpoints. If id is passed only removes the data breakpoint with the passed id.
    * Notifies debug adapter of breakpoint changes.
    */
    removeDataBreakpoints(id?: string): Promise<void>;
    /**
    * Adds a new instruction breakpoint.
    */
    addInstructionBreakpoint(opts: IInstructionBreakpointOptions): Promise<void>;
    /**
    * Removes all instruction breakpoints. If `address` is passed, only the
    * instruction breakpoint with the matching resolved memory address is
    * removed; this is preferred because the debug adapter is allowed to
    * return different `instructionReference` strings for the same memory
    * location on subsequent disassemble requests. If `address` is not
    * provided, falls back to matching on `instructionReference` (and
    * `offset` when specified). When no arguments are provided, all
    * instruction breakpoints are removed. Notifies the debug adapter of
    * breakpoint changes.
    */
    removeInstructionBreakpoints(instructionReference?: string, offset?: number, address?: bigint): Promise<void>;
    setExceptionBreakpointCondition(breakpoint: IExceptionBreakpoint, condition: string | undefined): Promise<void>;
    /**
    * Creates breakpoints based on the sesison filter options. This will create
    * disabled breakpoints (or enabled, if the filter indicates it's a default)
    * for each filter provided in the session.
    */
    setExceptionBreakpointsForSession(session: IDebugSession, filters: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    /**
    * Sends all breakpoints to the passed session.
    * If session is not passed, sends all breakpoints to each session.
    */
    sendAllBreakpoints(session?: IDebugSession): Promise<void>;
    /**
    * Sends breakpoints of the given source to the passed session.
    */
    sendBreakpoints(modelUri: uri, sourceModified?: boolean, session?: IDebugSession): Promise<void>;
    /**
    * Adds a new watch expression and evaluates it against the debug adapter.
    */
    addWatchExpression(name?: string): void;
    /**
    * Renames a watch expression and evaluates it against the debug adapter.
    */
    renameWatchExpression(id: string, newName: string): void;
    /**
    * Moves a watch expression to a new possition. Used for reordering watch expressions.
    */
    moveWatchExpression(id: string, position: number): void;
    /**
    * Removes all watch expressions. If id is passed only removes the watch expression with the passed id.
    */
    removeWatchExpressions(id?: string): void;
    /**
    * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
    * Also saves all files, manages if compounds are present in the configuration
    * and resolveds configurations via DebugConfigurationProviders.
    *
    * Returns true if the start debugging was successful. For compound launches, all configurations have to start successfully for it to return success.
    * On errors the startDebugging will throw an error, however some error and cancelations are handled and in that case will simply return false.
    */
    startDebugging(launch: ILaunch | undefined, configOrName?: IConfig | string, options?: IDebugSessionOptions, saveBeforeStart?: boolean): Promise<boolean>;
    /**
    * Restarts a session or creates a new one if there is no active session.
    */
    restartSession(session: IDebugSession, restartData?: unknown): Promise<void>;
    /**
    * Stops the session. If no session is specified then all sessions are stopped.
    */
    stopSession(session: IDebugSession | undefined, disconnect?: boolean, suspend?: boolean): Promise<void>;
    /**
    * Makes unavailable all sources with the passed uri. Source will appear as grayed out in callstack view.
    */
    sourceIsNotAvailable(uri: uri): void;
    /**
    * Gets the current debug model.
    */
    getModel(): IDebugModel;
    /**
    * Gets the current view model.
    */
    getViewModel(): IViewModel;
    /**
    * Resumes execution and pauses until the given position is reached.
    */
    runTo(uri: uri, lineNumber: number, column?: number): Promise<void>;
}
