import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { ExtensionHostKind } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionDescriptionDelta } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProxy";
import { ExtensionRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IExtensionInspectInfo, IInternalExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
import { ResponsiveState } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/rpcProtocol";
export declare class ExtensionHostManager extends Disposable implements IExtensionHostManager {
    private readonly _internalExtensionService;
    private readonly _instantiationService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    readonly onDidExit: Event<[
        number,
        string | null
    ]>;
    private readonly _onDidChangeResponsiveState;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    /**
     * A map of already requested activation events to speed things up if the same activation event is triggered multiple times.
     */
    private readonly _cachedActivationEvents;
    private readonly _resolvedActivationEvents;
    private _rpcProtocol;
    private readonly _customers;
    private readonly _extensionHost;
    private _proxy;
    private _hasStarted;
    get pid(): number | null;
    get kind(): ExtensionHostKind;
    get startup(): ExtensionHostStartup;
    get friendyName(): string;
    constructor(extensionHost: IExtensionHost, initialActivationEvents: string[], _internalExtensionService: IInternalExtensionService, _instantiationService: IInstantiationService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService);
    disconnect(): Promise<void>;
    dispose(): void;
    private measure;
    get isReady(): boolean;
    ready(): Promise<void>;
    private _measureLatency;
    private static _convert;
    private _measureUp;
    private _measureDown;
    private _createExtensionHostCustomers;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    private _activateByEvent;
    getInspectPort(tryEnableInspector: boolean): Promise<IExtensionInspectInfo | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(incomingExtensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export declare function friendlyExtHostName(kind: ExtensionHostKind, pid: number | null): string;
