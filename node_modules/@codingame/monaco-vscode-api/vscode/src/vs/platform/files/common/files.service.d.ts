import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IFileSystemProviderRegistrationEvent, IFileSystemProviderCapabilitiesChangeEvent, IFileSystemProviderActivationEvent, IFileSystemProvider, FileSystemProviderCapabilities, FileChangesEvent, FileOperationEvent, IResolveMetadataFileOptions, IFileStatWithMetadata, IResolveFileOptions, IFileStat, IFileStatResult, IFileStatWithPartialMetadata, IReadFileOptions, IFileContent, IReadFileStreamOptions, IFileStreamContent, IWriteFileOptions, ICreateFileOptions, IFileDeleteOptions, IWatchOptionsWithoutCorrelation, IFileSystemWatcher } from "./files.js";
export declare const IFileService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IFileService>;
export interface IFileService {
    readonly _serviceBrand: undefined;
    /**
    * An event that is fired when a file system provider is added or removed
    */
    readonly onDidChangeFileSystemProviderRegistrations: Event<IFileSystemProviderRegistrationEvent>;
    /**
    * An event that is fired when a registered file system provider changes its capabilities.
    */
    readonly onDidChangeFileSystemProviderCapabilities: Event<IFileSystemProviderCapabilitiesChangeEvent>;
    /**
    * An event that is fired when a file system provider is about to be activated. Listeners
    * can join this event with a long running promise to help in the activation process.
    */
    readonly onWillActivateFileSystemProvider: Event<IFileSystemProviderActivationEvent>;
    /**
    * Registers a file system provider for a certain scheme.
    */
    registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable;
    /**
    * Returns a file system provider for a certain scheme.
    */
    getProvider(scheme: string): IFileSystemProvider | undefined;
    /**
    * Tries to activate a provider with the given scheme.
    */
    activateProvider(scheme: string): Promise<void>;
    /**
    * Checks if this file service can handle the given resource by
    * first activating any extension that wants to be activated
    * on the provided resource scheme to include extensions that
    * contribute file system providers for the given resource.
    */
    canHandleResource(resource: URI): Promise<boolean>;
    /**
    * Checks if the file service has a registered provider for the
    * provided resource.
    *
    * Note: this does NOT account for contributed providers from
    * extensions that have not been activated yet. To include those,
    * consider to call `await fileService.canHandleResource(resource)`.
    */
    hasProvider(resource: URI): boolean;
    /**
    * Checks if the provider for the provided resource has the provided file system capability.
    */
    hasCapability(resource: URI, capability: FileSystemProviderCapabilities): boolean;
    /**
    * List the schemes and capabilities for registered file system providers
    */
    listCapabilities(): Iterable<{
        scheme: string;
        capabilities: FileSystemProviderCapabilities;
    }>;
    /**
    * Allows to listen for file changes. The event will fire for every file within the opened workspace
    * (if any) as well as all files that have been watched explicitly using the #watch() API.
    */
    readonly onDidFilesChange: Event<FileChangesEvent>;
    /**
    * An event that is fired upon successful completion of a certain file operation.
    */
    readonly onDidRunOperation: Event<FileOperationEvent>;
    /**
    * Resolve the properties of a file/folder identified by the resource. For a folder, children
    * information is resolved as well depending on the provided options. Use `stat()` method if
    * you do not need children information.
    *
    * If the optional parameter "resolveTo" is specified in options, the stat service is asked
    * to provide a stat object that should contain the full graph of folders up to all of the
    * target resources.
    *
    * If the optional parameter "resolveSingleChildDescendants" is specified in options,
    * the stat service is asked to automatically resolve child folders that only
    * contain a single element.
    *
    * If the optional parameter "resolveMetadata" is specified in options,
    * the stat will contain metadata information such as size, mtime and etag.
    */
    resolve(resource: URI, options: IResolveMetadataFileOptions): Promise<IFileStatWithMetadata>;
    resolve(resource: URI, options?: IResolveFileOptions): Promise<IFileStat>;
    /**
    * Same as `resolve()` but supports resolving multiple resources in parallel.
    *
    * If one of the resolve targets fails to resolve returns a fake `IFileStat` instead of
    * making the whole call fail.
    */
    resolveAll(toResolve: {
        resource: URI;
        options: IResolveMetadataFileOptions;
    }[]): Promise<IFileStatResult[]>;
    resolveAll(toResolve: {
        resource: URI;
        options?: IResolveFileOptions;
    }[]): Promise<IFileStatResult[]>;
    /**
    * Same as `resolve()` but without resolving the children of a folder if the
    * resource is pointing to a folder.
    */
    stat(resource: URI): Promise<IFileStatWithPartialMetadata>;
    /**
    * Attempts to resolve the real path of the provided resource. The real path can be
    * different from the resource path for example when it is a symlink.
    *
    * Will return `undefined` if the real path cannot be resolved.
    */
    realpath(resource: URI): Promise<URI | undefined>;
    /**
    * Finds out if a file/folder identified by the resource exists.
    */
    exists(resource: URI): Promise<boolean>;
    /**
    * Read the contents of the provided resource unbuffered.
    */
    readFile(resource: URI, options?: IReadFileOptions, token?: CancellationToken): Promise<IFileContent>;
    /**
    * Read the contents of the provided resource buffered as stream.
    */
    readFileStream(resource: URI, options?: IReadFileStreamOptions, token?: CancellationToken): Promise<IFileStreamContent>;
    /**
    * Updates the content replacing its previous value.
    * If `options.append` is true, appends content to the end of the file instead.
    *
    * Emits a `FileOperation.WRITE` file operation event when successful.
    */
    writeFile(resource: URI, bufferOrReadableOrStream: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
    /**
    * Moves the file/folder to a new path identified by the resource.
    *
    * The optional parameter overwrite can be set to replace an existing file at the location.
    *
    * Emits a `FileOperation.MOVE` file operation event when successful.
    */
    move(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    /**
    * Find out if a move operation is possible given the arguments. No changes on disk will
    * be performed. Returns an Error if the operation cannot be done.
    */
    canMove(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    /**
    * Copies the file/folder to a path identified by the resource. A folder is copied
    * recursively.
    *
    * Emits a `FileOperation.COPY` file operation event when successful.
    */
    copy(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    /**
    * Find out if a copy operation is possible given the arguments. No changes on disk will
    * be performed. Returns an Error if the operation cannot be done.
    */
    canCopy(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    /**
    * Clones a file to a path identified by the resource. Folders are not supported.
    *
    * If the target path exists, it will be overwritten.
    */
    cloneFile(source: URI, target: URI): Promise<void>;
    /**
    * Creates a new file with the given path and optional contents. The returned promise
    * will have the stat model object as a result.
    *
    * The optional parameter content can be used as value to fill into the new file.
    *
    * Emits a `FileOperation.CREATE` file operation event when successful.
    */
    createFile(resource: URI, bufferOrReadableOrStream?: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: ICreateFileOptions): Promise<IFileStatWithMetadata>;
    /**
    * Find out if a file create operation is possible given the arguments. No changes on disk will
    * be performed. Returns an Error if the operation cannot be done.
    */
    canCreateFile(resource: URI, options?: ICreateFileOptions): Promise<Error | true>;
    /**
    * Creates a new folder with the given path. The returned promise
    * will have the stat model object as a result.
    *
    * Emits a `FileOperation.CREATE` file operation event when successful.
    */
    createFolder(resource: URI): Promise<IFileStatWithMetadata>;
    /**
    * Deletes the provided file. The optional useTrash parameter allows to
    * move the file to trash. The optional recursive parameter allows to delete
    * non-empty folders recursively.
    *
    * Emits a `FileOperation.DELETE` file operation event when successful.
    */
    del(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<void>;
    /**
    * Find out if a delete operation is possible given the arguments. No changes on disk will
    * be performed. Returns an Error if the operation cannot be done.
    */
    canDelete(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<Error | true>;
    /**
    * An event that signals an error when watching for file changes.
    */
    readonly onDidWatchError: Event<Error>;
    /**
    * Allows to start a watcher that reports file/folder change events on the provided resource.
    *
    * The watcher runs correlated and thus, file events will be reported on the returned
    * `IFileSystemWatcher` and not on the generic `IFileService.onDidFilesChange` event.
    *
    * Note: only non-recursive file watching supports event correlation for now.
    */
    createWatcher(resource: URI, options: IWatchOptionsWithoutCorrelation & {
        recursive: false;
    }): IFileSystemWatcher;
    /**
    * Allows to start a watcher that reports file/folder change events on the provided resource.
    *
    * The watcher runs uncorrelated and thus will report all events from `IFileService.onDidFilesChange`.
    * This means, most listeners in the application will receive your events. It is encouraged to
    * use correlated watchers (via `IWatchOptionsWithCorrelation`) to limit events to your listener.
    */
    watch(resource: URI, options?: IWatchOptionsWithoutCorrelation): IDisposable;
    /**
    * Frees up any resources occupied by this service.
    */
    dispose(): void;
}
