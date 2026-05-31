import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ExtensionHostKind } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionDescriptionDelta } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProxy";
import { ExtensionRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionInspectInfo } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
import { ResponsiveState } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/rpcProtocol";
export interface IExtensionHostManager {
    readonly pid: number | null;
    readonly kind: ExtensionHostKind;
    readonly startup: ExtensionHostStartup;
    readonly friendyName: string;
    readonly onDidExit: Event<[
        number,
        string | null
    ]>;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    disconnect(): Promise<void>;
    dispose(): void;
    readonly isReady: boolean;
    ready(): Promise<void>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    getInspectPort(tryEnableInspector: boolean): Promise<IExtensionInspectInfo | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    /**
     * Returns `null` if no resolver for `remoteAuthority` is found.
     */
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: readonly IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
