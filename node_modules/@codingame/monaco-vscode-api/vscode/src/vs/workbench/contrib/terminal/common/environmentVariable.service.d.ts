import { Event } from "../../../../base/common/event.js";
import { IEnvironmentVariableCollection, IMergedEnvironmentVariableCollection } from "@codingame/monaco-vscode-xterm-common/vscode/vs/platform/terminal/common/environmentVariable";
export declare const IEnvironmentVariableService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEnvironmentVariableService>;
/**
* Tracks and persists environment variable collections as defined by extensions.
*/
export interface IEnvironmentVariableService {
    readonly _serviceBrand: undefined;
    /**
    * Gets a single collection constructed by merging all environment variable collections into
    * one.
    */
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    /**
    * Gets a single collection constructed by merging all environment variable collections into
    * one.
    */
    readonly mergedCollection: IMergedEnvironmentVariableCollection;
    /**
    * An event that is fired when an extension's environment variable collection changes, the event
    * provides the new merged collection.
    */
    readonly onDidChangeCollections: Event<IMergedEnvironmentVariableCollection>;
    /**
    * Sets an extension's environment variable collection.
    */
    set(extensionIdentifier: string, collection: IEnvironmentVariableCollection): void;
    /**
    * Deletes an extension's environment variable collection.
    */
    delete(extensionIdentifier: string): void;
}
