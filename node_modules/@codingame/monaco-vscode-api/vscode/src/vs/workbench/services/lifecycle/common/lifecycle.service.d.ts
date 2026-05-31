import { Event } from "../../../../base/common/event.js";
import { StartupKind, LifecyclePhase, BeforeShutdownEvent, BeforeShutdownErrorEvent, WillShutdownEvent } from "./lifecycle.js";
export declare const ILifecycleService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILifecycleService>;
/**
* A lifecycle service informs about lifecycle events of the
* application, such as shutdown.
*/
export interface ILifecycleService {
    readonly _serviceBrand: undefined;
    /**
    * Value indicates how this window got loaded.
    */
    readonly startupKind: StartupKind;
    readonly shouldAttemptTaskReconnection: boolean;
    /**
    * A flag indicating in what phase of the lifecycle we currently are.
    */
    phase: LifecyclePhase;
    /**
    * Fired before shutdown happens. Allows listeners to veto against the
    * shutdown to prevent it from happening.
    *
    * The event carries a shutdown reason that indicates how the shutdown was triggered.
    */
    readonly onBeforeShutdown: Event<BeforeShutdownEvent>;
    /**
    * Fired when the shutdown was prevented by a component giving veto.
    */
    readonly onShutdownVeto: Event<void>;
    /**
    * Fired when an error happened during `onBeforeShutdown` veto handling.
    * In this case the shutdown operation will not proceed because this is
    * an unexpected condition that is treated like a veto.
    *
    * The event carries a shutdown reason that indicates how the shutdown was triggered.
    */
    readonly onBeforeShutdownError: Event<BeforeShutdownErrorEvent>;
    /**
    * Fired when no client is preventing the shutdown from happening (from `onBeforeShutdown`).
    *
    * This event can be joined with a long running operation via `WillShutdownEvent#join()` to
    * handle long running shutdown operations.
    *
    * The event carries a shutdown reason that indicates how the shutdown was triggered.
    */
    readonly onWillShutdown: Event<WillShutdownEvent>;
    /**
    * A flag indicating that we are about to shutdown without further veto.
    */
    readonly willShutdown: boolean;
    /**
    * Fired when the shutdown is about to happen after long running shutdown operations
    * have finished (from `onWillShutdown`).
    *
    * This event should be used to dispose resources.
    */
    readonly onDidShutdown: Event<void>;
    /**
    * Returns a promise that resolves when a certain lifecycle phase
    * has started.
    */
    when(phase: LifecyclePhase): Promise<void>;
    /**
    * Triggers a shutdown of the workbench. Depending on native or web, this can have
    * different implementations and behaviour.
    *
    * **Note:** this should normally not be called. See related methods in `IHostService`
    * and `INativeHostService` to close a window or quit the application.
    */
    shutdown(): Promise<void>;
}
