import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { SaveSource } from "../../../common/editor.js";
import { IWorkingCopyHistoryEvent, IWorkingCopyHistoryEntryDescriptor, IWorkingCopyHistoryEntry } from "@codingame/monaco-vscode-working-copy-service-override/vscode/vs/workbench/services/workingCopy/common/workingCopyHistory";
export declare const IWorkingCopyHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyHistoryService>;
export interface IWorkingCopyHistoryService {
    readonly _serviceBrand: undefined;
    /**
    * An event when an entry is added to the history.
    */
    readonly onDidAddEntry: Event<IWorkingCopyHistoryEvent>;
    /**
    * An event when an entry is changed in the history.
    */
    readonly onDidChangeEntry: Event<IWorkingCopyHistoryEvent>;
    /**
    * An event when an entry is replaced in the history.
    */
    readonly onDidReplaceEntry: Event<IWorkingCopyHistoryEvent>;
    /**
    * An event when an entry is removed from the history.
    */
    readonly onDidRemoveEntry: Event<IWorkingCopyHistoryEvent>;
    /**
    * An event when entries are moved in history.
    */
    readonly onDidMoveEntries: Event<void>;
    /**
    * An event when all entries are removed from the history.
    */
    readonly onDidRemoveEntries: Event<void>;
    /**
    * Adds a new entry to the history for the given working copy
    * with an optional associated descriptor.
    */
    addEntry(descriptor: IWorkingCopyHistoryEntryDescriptor, token: CancellationToken): Promise<IWorkingCopyHistoryEntry | undefined>;
    /**
    * Updates an entry in the local history if found.
    */
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    /**
    * Removes an entry from the local history if found.
    */
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    /**
    * Moves entries that either match the `source` or are a child
    * of `source` to the `target`.
    *
    * @returns a list of resources for entries that have moved.
    */
    moveEntries(source: URI, target: URI): Promise<URI[]>;
    /**
    * Gets all history entries for the provided resource.
    */
    getEntries(resource: URI, token: CancellationToken): Promise<readonly IWorkingCopyHistoryEntry[]>;
    /**
    * Returns all resources for which history entries exist.
    */
    getAll(token: CancellationToken): Promise<readonly URI[]>;
    /**
    * Removes all entries from all of local history.
    */
    removeAll(token: CancellationToken): Promise<void>;
}
