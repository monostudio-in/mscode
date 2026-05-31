import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceFolderData } from "../../../../platform/workspace/common/workspace.js";
import { IResolvedValue } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { IMcpHostDelegate, IMcpResolveConnectionOptions } from "./mcpRegistryTypes.js";
import { McpCollectionDefinition, LazyCollectionState, McpDefinitionReference, McpServerDefinition, IMcpServerConnection } from "./mcpTypes.js";
export declare const IMcpRegistry: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpRegistry>;
export interface IMcpRegistry {
    readonly _serviceBrand: undefined;
    /** Fired when the user provides more inputs when creating a connection. */
    readonly onDidChangeInputs: Event<void>;
    readonly collections: IObservable<readonly McpCollectionDefinition[]>;
    readonly delegates: IObservable<readonly IMcpHostDelegate[]>;
    /** Whether there are new collections that can be resolved with a discover() call */
    readonly lazyCollectionState: IObservable<{
        state: LazyCollectionState;
        collections: McpCollectionDefinition[];
    }>;
    /** Helper function to observe a definition by its reference. */
    getServerDefinition(collectionRef: McpDefinitionReference, definitionRef: McpDefinitionReference): IObservable<{
        server: McpServerDefinition | undefined;
        collection: McpCollectionDefinition | undefined;
    }>;
    /** Discover new collections, returning newly-discovered ones. */
    discoverCollections(): Promise<McpCollectionDefinition[]>;
    registerDelegate(delegate: IMcpHostDelegate): IDisposable;
    registerCollection(collection: McpCollectionDefinition): IDisposable;
    /** Resets any saved inputs for the input, or globally. */
    clearSavedInputs(scope: StorageScope, inputId?: string): Promise<void>;
    /** Edits a previously-saved input. */
    editSavedInput(inputId: string, folderData: IWorkspaceFolderData | undefined, configSection: string, target: ConfigurationTarget): Promise<void>;
    /** Updates a saved input. */
    setSavedInput(inputId: string, target: ConfigurationTarget, value: string): Promise<void>;
    /** Gets saved inputs from storage. */
    getSavedInputs(scope: StorageScope): Promise<{
        [id: string]: IResolvedValue;
    }>;
    /** Creates a connection for the collection and definition. */
    resolveConnection(options: IMcpResolveConnectionOptions): Promise<IMcpServerConnection | undefined>;
}
