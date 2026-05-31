import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IRemoteFilesystemConnection } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/platform/agentHost/common/agentHostFileSystemProvider";
export declare const IAgentHostFileSystemService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentHostFileSystemService>;
export interface IAgentHostFileSystemService {
    readonly _serviceBrand: undefined;
    /**
    * Register a mapping from a URI authority to a connection so that
    * `vscode-agent-host://[authority]/…` URIs resolve through this connection.
    */
    registerAuthority(authority: string, connection: IRemoteFilesystemConnection): IDisposable;
    /**
    * Ensures the in-memory filesystem provider for synced customizations
    * (`vscode-synced-customization:` scheme) is registered. Called lazily
    * by {@link SyncedCustomizationBundler} — safe to call multiple times.
    */
    ensureSyncedCustomizationProvider(): void;
}
