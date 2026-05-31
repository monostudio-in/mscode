import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { WillShutdownEvent, StartupKind, LifecyclePhase, ShutdownReason, BeforeShutdownErrorEvent, InternalBeforeShutdownEvent } from "./lifecycle.js";
import { ILifecycleService } from "./lifecycle.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
export declare abstract class AbstractLifecycleService extends Disposable implements ILifecycleService {
    protected readonly logService: ILogService;
    protected readonly storageService: IStorageService;
    private static readonly LAST_SHUTDOWN_REASON_KEY;
    readonly _serviceBrand: undefined;
    protected readonly _onBeforeShutdown: Emitter<InternalBeforeShutdownEvent>;
    readonly onBeforeShutdown: import("../../../../base/common/event.js").Event<InternalBeforeShutdownEvent>;
    protected readonly _onWillShutdown: Emitter<WillShutdownEvent>;
    readonly onWillShutdown: import("../../../../base/common/event.js").Event<WillShutdownEvent>;
    protected readonly _onDidShutdown: Emitter<void>;
    readonly onDidShutdown: import("../../../../base/common/event.js").Event<void>;
    protected readonly _onBeforeShutdownError: Emitter<BeforeShutdownErrorEvent>;
    readonly onBeforeShutdownError: import("../../../../base/common/event.js").Event<BeforeShutdownErrorEvent>;
    protected readonly _onShutdownVeto: Emitter<void>;
    readonly onShutdownVeto: import("../../../../base/common/event.js").Event<void>;
    private _startupKind;
    get startupKind(): StartupKind;
    get shouldAttemptTaskReconnection(): boolean;
    private _phase;
    get phase(): LifecyclePhase;
    protected _willShutdown: boolean;
    get willShutdown(): boolean;
    private readonly phaseWhen;
    protected shutdownReason: ShutdownReason | undefined;
    constructor(logService: ILogService, storageService: IStorageService);
    private resolveStartupKind;
    protected doResolveStartupKind(): StartupKind | undefined;
    set phase(value: LifecyclePhase);
    when(phase: LifecyclePhase): Promise<void>;
    /**
     * Subclasses to implement the explicit shutdown method.
     */
    abstract shutdown(): Promise<void>;
}
