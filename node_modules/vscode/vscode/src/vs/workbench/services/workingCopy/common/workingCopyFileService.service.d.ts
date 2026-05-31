import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileStatWithMetadata } from "../../../../platform/files/common/files.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from "./storedFileWorkingCopy.js";
import { IWorkingCopy } from "./workingCopy.js";
import { WorkingCopyFileEvent, IWorkingCopyFileOperationParticipant, IStoredFileWorkingCopySaveParticipant, IStoredFileWorkingCopySaveParticipantContext, ICreateFileOperation, IFileOperationUndoRedoInfo, ICreateOperation, IMoveOperation, ICopyOperation, IDeleteOperation, WorkingCopyProvider } from "@codingame/monaco-vscode-base-service-override/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare const IWorkingCopyFileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyFileService>;
/**
* A service that allows to perform file operations with working copy support.
* Any operation that would leave a stale dirty working copy behind will make
* sure to revert the working copy first.
*
* On top of that events are provided to participate in each state of the
* operation to perform additional work.
*/
export interface IWorkingCopyFileService {
    readonly _serviceBrand: undefined;
    /**
    * An event that is fired when a certain working copy IO operation is about to run.
    *
    * Participants can join this event with a long running operation to keep some state
    * before the operation is started, but working copies should not be changed at this
    * point in time. For that purpose, use the `IWorkingCopyFileOperationParticipant` API.
    */
    readonly onWillRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
    * An event that is fired after a working copy IO operation has failed.
    *
    * Participants can join this event with a long running operation to clean up as needed.
    */
    readonly onDidFailWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
    * An event that is fired after a working copy IO operation has been performed.
    *
    * Participants can join this event with a long running operation to make changes
    * after the operation has finished.
    */
    readonly onDidRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
    * Adds a participant for file operations on working copies.
    */
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    /**
    * Whether save participants are present for stored file working copies.
    */
    get hasSaveParticipants(): boolean;
    /**
    * Adds a participant for save operations on stored file working copies.
    */
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    /**
    * Runs all available save participants for stored file working copies.
    */
    runSaveParticipants(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    /**
    * Will create a resource with the provided optional contents, optionally overwriting any target.
    *
    * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
    * `onDidRunWorkingCopyFileOperation` events to participate.
    */
    create(operations: ICreateFileOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
    * Will create a folder and any parent folder that needs to be created.
    *
    * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
    * `onDidRunWorkingCopyFileOperation` events to participate.
    *
    * Note: events will only be emitted for the provided resource, but not any
    * parent folders that are being created as part of the operation.
    */
    createFolder(operations: ICreateOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
    * Will move working copies matching the provided resources and corresponding children
    * to the target resources using the associated file service for those resources.
    *
    * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
    * `onDidRunWorkingCopyFileOperation` events to participate.
    */
    move(operations: IMoveOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
    * Will copy working copies matching the provided resources and corresponding children
    * to the target resources using the associated file service for those resources.
    *
    * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
    * `onDidRunWorkingCopyFileOperation` events to participate.
    */
    copy(operations: ICopyOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
    * Will delete working copies matching the provided resources and children
    * using the associated file service for those resources.
    *
    * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
    * `onDidRunWorkingCopyFileOperation` events to participate.
    */
    delete(operations: IDeleteOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<void>;
    /**
    * Register a new provider for working copies based on a resource.
    *
    * @return a disposable that unregisters the provider.
    */
    registerWorkingCopyProvider(provider: WorkingCopyProvider): IDisposable;
    /**
    * Will return all working copies that are dirty matching the provided resource.
    * If the resource is a folder and the scheme supports file operations, a working
    * copy that is dirty and is a child of that folder will also be returned.
    */
    getDirty(resource: URI): readonly IWorkingCopy[];
}
