import { URI } from "../../../../base/common/uri.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ISaveOptions, IRevertOptions, SaveReason } from "../../../common/editor.js";
import { IBaseFileStatWithMetadata, IFileStatWithMetadata, IWriteFileOptions, FileOperationError, IReadFileStreamOptions, IFileReadLimits } from "../../../../platform/files/common/files.js";
import { ITextEditorModel } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
import { ITextBufferFactory, ITextModel, ITextSnapshot } from "../../../../editor/common/model.js";
import { VSBuffer, VSBufferReadable } from "../../../../base/common/buffer.js";
import { IWorkingCopy, IWorkingCopySaveEvent } from "../../workingCopy/common/workingCopy.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
export interface IReadTextFileEncodingOptions {
    /**
     * The optional encoding parameter allows to specify the desired encoding when resolving
     * the contents of the file.
     */
    readonly encoding?: string;
    /**
     * The optional guessEncoding parameter allows to guess encoding from content of the file.
     */
    readonly autoGuessEncoding?: boolean;
    /**
     * The optional candidateGuessEncodings parameter limits the allowed encodings to guess from.
     */
    readonly candidateGuessEncodings?: string[];
    /**
     * The optional acceptTextOnly parameter allows to fail this request early if the file
     * contents are not textual.
     */
    readonly acceptTextOnly?: boolean;
}
export interface IReadTextFileOptions extends IReadTextFileEncodingOptions, IReadFileStreamOptions {
}
export interface IWriteTextFileOptions extends IWriteFileOptions {
    /**
     * The encoding to use when updating a file.
     */
    readonly encoding?: string;
    /**
     * Whether to write to the file as elevated (admin) user. When setting this option a prompt will
     * ask the user to authenticate as super user.
     */
    readonly writeElevated?: boolean;
}
export declare enum TextFileOperationResult {
    FILE_IS_BINARY = 0
}
export declare class TextFileOperationError extends FileOperationError {
    textFileOperationResult: TextFileOperationResult;
    static isTextFileOperationError(obj: unknown): obj is TextFileOperationError;
    readonly options?: IReadTextFileOptions & IWriteTextFileOptions;
    constructor(message: string, textFileOperationResult: TextFileOperationResult, options?: IReadTextFileOptions & IWriteTextFileOptions);
}
export interface IResourceEncodings {
    getPreferredReadEncoding(resource: URI): Promise<IResourceEncoding>;
    getPreferredWriteEncoding(resource: URI, preferredEncoding?: string): Promise<IResourceEncoding>;
}
export interface IResourceEncoding {
    readonly encoding: string;
    readonly hasBOM: boolean;
}
/**
 * The save error handler can be installed on the text file editor model to install code that executes when save errors occur.
 */
export interface ISaveErrorHandler {
    /**
     * Called whenever a save fails.
     */
    onSaveError(error: Error, model: ITextFileEditorModel, options: ITextFileSaveAsOptions): void;
}
/**
 * States the text file editor model can be in.
 */
export declare enum TextFileEditorModelState {
    /**
     * A model is saved.
     */
    SAVED = 0,
    /**
     * A model is dirty.
     */
    DIRTY = 1,
    /**
     * A model is currently being saved but this operation has not completed yet.
     */
    PENDING_SAVE = 2,
    /**
     * A model is in conflict mode when changes cannot be saved because the
     * underlying file has changed. Models in conflict mode are always dirty.
     */
    CONFLICT = 3,
    /**
     * A model is in orphan state when the underlying file has been deleted.
     */
    ORPHAN = 4,
    /**
     * Any error that happens during a save that is not causing the CONFLICT state.
     * Models in error mode are always dirty.
     */
    ERROR = 5
}
export declare enum TextFileResolveReason {
    EDITOR = 1,
    REFERENCE = 2,
    OTHER = 3
}
interface IBaseTextFileContent extends IBaseFileStatWithMetadata {
    /**
     * The encoding of the content if known.
     */
    readonly encoding: string;
}
export interface ITextFileContent extends IBaseTextFileContent {
    /**
     * The content of a text file.
     */
    readonly value: string;
}
export interface ITextFileStreamContent extends IBaseTextFileContent {
    /**
     * The line grouped content of a text file.
     */
    readonly value: ITextBufferFactory;
}
export interface ITextFileEditorModelResolveOrCreateOptions extends ITextFileResolveOptions {
    /**
     * The language id to use for the model text content.
     */
    readonly languageId?: string;
    /**
     * The encoding to use when resolving the model text content.
     */
    readonly encoding?: string;
    /**
     * If the model was already resolved before, allows to trigger
     * a reload of it to fetch the latest contents.
     */
    readonly reload?: {
        /**
         * Controls whether the reload happens in the background
         * or whether `resolve` will await the reload to happen.
         */
        readonly async: boolean;
    };
}
export interface ITextFileSaveEvent extends ITextFileEditorModelSaveEvent {
    /**
     * The model that was saved.
     */
    readonly model: ITextFileEditorModel;
}
export interface ITextFileResolveEvent {
    /**
     * The model that was resolved.
     */
    readonly model: ITextFileEditorModel;
    /**
     * The reason why the model was resolved.
     */
    readonly reason: TextFileResolveReason;
}
export interface ITextFileSaveParticipantContext {
    /**
     * The reason why the save was triggered.
     */
    readonly reason: SaveReason;
    /**
     * Only applies to when a text file was saved as, for
     * example when starting with untitled and saving. This
     * provides access to the initial resource the text
     * file had before.
     */
    readonly savedFrom?: URI;
}
export interface ITextFileSaveParticipant {
    /**
     * The ordinal number which determines the order of participation.
     * Lower values mean to participant sooner
     */
    readonly ordinal?: number;
    /**
     * Participate in a save of a model. Allows to change the model
     * before it is being saved to disk.
     */
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
}
export interface ITextFileEditorModelManager {
    readonly onDidCreate: Event<ITextFileEditorModel>;
    readonly onDidResolve: Event<ITextFileResolveEvent>;
    readonly onDidChangeDirty: Event<ITextFileEditorModel>;
    readonly onDidChangeReadonly: Event<ITextFileEditorModel>;
    readonly onDidRemove: Event<URI>;
    readonly onDidChangeOrphaned: Event<ITextFileEditorModel>;
    readonly onDidChangeEncoding: Event<ITextFileEditorModel>;
    readonly onDidSaveError: Event<ITextFileEditorModel>;
    readonly onDidSave: Event<ITextFileSaveEvent>;
    readonly onDidRevert: Event<ITextFileEditorModel>;
    /**
     * Access to all text file editor models in memory.
     */
    readonly models: ITextFileEditorModel[];
    /**
     * Allows to configure the error handler that is called on save errors.
     */
    saveErrorHandler: ISaveErrorHandler;
    /**
     * Returns the text file editor model for the provided resource
     * or undefined if none.
     */
    get(resource: URI): ITextFileEditorModel | undefined;
    /**
     * Allows to resolve a text file model from disk.
     */
    resolve(resource: URI, options?: ITextFileEditorModelResolveOrCreateOptions): Promise<ITextFileEditorModel>;
    /**
     * Adds a participant for saving text file models.
     */
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    /**
     * Runs the registered save participants on the provided model.
     */
    runSaveParticipants(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    /**
     * Waits for the model to be ready to be disposed. There may be conditions
     * under which the model cannot be disposed, e.g. when it is dirty. Once the
     * promise is settled, it is safe to dispose the model.
     */
    canDispose(model: ITextFileEditorModel): true | Promise<true>;
}
export interface ITextFileSaveOptions extends ISaveOptions {
    /**
     * Save the file with an attempt to unlock it.
     */
    readonly writeUnlock?: boolean;
    /**
     * Save the file with elevated privileges.
     *
     * Note: This may not be supported in all environments.
     */
    readonly writeElevated?: boolean;
    /**
     * Allows to write to a file even if it has been modified on disk.
     */
    readonly ignoreModifiedSince?: boolean;
    /**
     * If set, will bubble up the error to the caller instead of handling it.
     */
    readonly ignoreErrorHandler?: boolean;
}
export interface ITextFileSaveAsOptions extends ITextFileSaveOptions {
    /**
     * Optional URI of the resource the text file is saved from if known.
     */
    readonly from?: URI;
    /**
     * Optional URI to use as suggested file path to save as.
     */
    readonly suggestedTarget?: URI;
}
export interface ITextFileResolveOptions {
    /**
     * The contents to use for the model if known. If not
     * provided, the contents will be retrieved from the
     * underlying resource or backup if present.
     */
    readonly contents?: ITextBufferFactory;
    /**
     * Go to file bypassing any cache of the model if any.
     */
    readonly forceReadFromFile?: boolean;
    /**
     * Allow to resolve a model even if we think it is a binary file.
     */
    readonly allowBinary?: boolean;
    /**
     * Context why the model is being resolved.
     */
    readonly reason?: TextFileResolveReason;
    /**
     * If provided, the size of the file will be checked against the limits
     * and an error will be thrown if any limit is exceeded.
     */
    readonly limits?: IFileReadLimits;
}
export declare enum EncodingMode {
    /**
     * Instructs the encoding support to encode the object with the provided encoding
     */
    Encode = 0,
    /**
     * Instructs the encoding support to decode the object with the provided encoding
     */
    Decode = 1
}
export interface IEncodingSupport {
    /**
     * Gets the encoding of the object if known.
     */
    getEncoding(): string | undefined;
    /**
     * Sets the encoding for the object for saving.
     */
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
}
export interface ILanguageSupport {
    /**
     * Sets the language id of the object.
     */
    setLanguageId(languageId: string, source?: string): void;
}
export interface ITextFileEditorModelSaveEvent extends IWorkingCopySaveEvent {
    /**
     * The resolved stat from the save operation.
     */
    readonly stat: IFileStatWithMetadata;
}
export interface ITextFileEditorModel extends ITextEditorModel, IEncodingSupport, ILanguageSupport, IWorkingCopy {
    readonly onDidSave: Event<ITextFileEditorModelSaveEvent>;
    readonly onDidSaveError: Event<void>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    readonly onDidChangeEncoding: Event<void>;
    hasState(state: TextFileEditorModelState): boolean;
    joinState(state: TextFileEditorModelState.PENDING_SAVE): Promise<void>;
    updatePreferredEncoding(encoding: string | undefined): void;
    save(options?: ITextFileSaveAsOptions): Promise<boolean>;
    revert(options?: IRevertOptions): Promise<void>;
    resolve(options?: ITextFileResolveOptions): Promise<void>;
    isDirty(): this is IResolvedTextFileEditorModel;
    getLanguageId(): string | undefined;
    isResolved(): this is IResolvedTextFileEditorModel;
}
export declare function isTextFileEditorModel(model: ITextEditorModel): model is ITextFileEditorModel;
export interface IResolvedTextFileEditorModel extends ITextFileEditorModel {
    readonly textEditorModel: ITextModel;
    createSnapshot(): ITextSnapshot;
}
export declare function snapshotToString(snapshot: ITextSnapshot): string;
export declare function stringToSnapshot(value: string): ITextSnapshot;
export declare function toBufferOrReadable(value: string): VSBuffer;
export declare function toBufferOrReadable(value: ITextSnapshot): VSBufferReadable;
export declare function toBufferOrReadable(value: string | ITextSnapshot): VSBuffer | VSBufferReadable;
export declare function toBufferOrReadable(value: string | ITextSnapshot | undefined): VSBuffer | VSBufferReadable | undefined;
export {};
