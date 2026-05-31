import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { ExtensionHostKind } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionDescriptionDelta } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProxy";
import { ExtensionRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IExtensionInspectInfo, IInternalExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
import { ResponsiveState } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/rpcProtocol";
/**
 * Waits until `start()` and only if it has extensions proceeds to really start.
 */
export declare class LazyCreateExtensionHostManager extends Disposable implements IExtensionHostManager {
    private readonly _initialActivationEvents;
    private readonly _internalExtensionService;
    private readonly _instantiationService;
    private readonly _logService;
    readonly onDidExit: Event<[
        number,
        string | null
    ]>;
    private readonly _onDidChangeResponsiveState;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    private readonly _extensionHost;
    private _startCalled;
    private _actual;
    get pid(): number | null;
    get kind(): ExtensionHostKind;
    get startup(): ExtensionHostStartup;
    get friendyName(): string;
    constructor(extensionHost: IExtensionHost, _initialActivationEvents: string[], _internalExtensionService: IInternalExtensionService, _instantiationService: IInstantiationService, _logService: ILogService);
    dispose(): void;
    private _createActual;
    private _getOrCreateActualAndStart;
    get isReady(): boolean;
    ready(): Promise<void>;
    disconnect(): Promise<void>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    getInspectPort(tryEnableInspector: boolean): Promise<IExtensionInspectInfo | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
