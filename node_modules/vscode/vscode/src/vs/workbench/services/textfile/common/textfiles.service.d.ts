import { VSBufferReadable, VSBuffer, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ReadableStream } from "../../../../base/common/stream.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextSnapshot } from "../../../../editor/common/model.js";
import { IFileStatWithMetadata } from "../../../../platform/files/common/files.js";
import { IRevertOptions } from "../../../common/editor.js";
import { IUntitledTextEditorModelManager } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/services/untitled/common/untitledTextEditorService";
import { IFileOperationUndoRedoInfo } from "@codingame/monaco-vscode-base-service-override/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService";
import { ITextFileEditorModelManager, IResourceEncodings, ITextFileSaveOptions, ITextFileSaveAsOptions, IReadTextFileOptions, ITextFileContent, ITextFileStreamContent, IWriteTextFileOptions, IReadTextFileEncodingOptions } from "./textfiles.js";
export declare const ITextFileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextFileService>;
export interface ITextFileService extends IDisposable {
    readonly _serviceBrand: undefined;
    /**
    * Access to the manager of text file editor models providing further
    * methods to work with them.
    */
    readonly files: ITextFileEditorModelManager;
    /**
    * Access to the manager of untitled text editor models providing further
    * methods to work with them.
    */
    readonly untitled: IUntitledTextEditorModelManager;
    /**
    * Helper to determine encoding for resources.
    */
    readonly encoding: IResourceEncodings;
    /**
    * A resource is dirty if it has unsaved changes or is an untitled file not yet saved.
    *
    * @param resource the resource to check for being dirty
    */
    isDirty(resource: URI): boolean;
    /**
    * Saves the resource.
    *
    * @param resource the resource to save
    * @param options optional save options
    * @return Path of the saved resource or undefined if canceled.
    */
    save(resource: URI, options?: ITextFileSaveOptions): Promise<URI | undefined>;
    /**
    * Saves the provided resource asking the user for a file name or using the provided one.
    *
    * @param resource the resource to save as.
    * @param targetResource the optional target to save to.
    * @param options optional save options
    * @return Path of the saved resource or undefined if canceled.
    */
    saveAs(resource: URI, targetResource?: URI, options?: ITextFileSaveAsOptions): Promise<URI | undefined>;
    /**
    * Reverts the provided resource.
    *
    * @param resource the resource of the file to revert.
    * @param force to force revert even when the file is not dirty
    */
    revert(resource: URI, options?: IRevertOptions): Promise<void>;
    /**
    * Read the contents of a file identified by the resource.
    */
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    /**
    * Read the contents of a file identified by the resource as stream.
    */
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    /**
    * Update a file with given contents.
    */
    write(resource: URI, value: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<IFileStatWithMetadata>;
    /**
    * Create files. If the file exists it will be overwritten with the contents if
    * the options enable to overwrite.
    */
    create(operations: {
        resource: URI;
        value?: string | ITextSnapshot;
        options?: {
            overwrite?: boolean;
        };
    }[], undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
    * Returns the readable that uses the appropriate encoding. This method should
    * be used whenever a `string` or `ITextSnapshot` is being persisted to the
    * file system.
    */
    getEncodedReadable(resource: URI | undefined, value: ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBufferReadable>;
    getEncodedReadable(resource: URI | undefined, value: string, options?: IWriteTextFileOptions): Promise<VSBuffer | VSBufferReadable>;
    getEncodedReadable(resource: URI | undefined, value?: ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBufferReadable | undefined>;
    getEncodedReadable(resource: URI | undefined, value?: string, options?: IWriteTextFileOptions): Promise<VSBuffer | VSBufferReadable | undefined>;
    getEncodedReadable(resource: URI | undefined, value?: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBuffer | VSBufferReadable | undefined>;
    /**
    * Returns a stream of strings that uses the appropriate encoding. This method should
    * be used whenever a `VSBufferReadableStream` is being loaded from the file system.
    *
    * Will throw an error if `acceptTextOnly: true` for resources that seem to be binary.
    */
    getDecodedStream(resource: URI | undefined, value: VSBufferReadableStream, options?: IReadTextFileEncodingOptions): Promise<ReadableStream<string>>;
    /**
    * Get the encoding for the provided `resource`. Will try to determine the encoding
    * from any existing model for that `resource` and fallback to the configured defaults.
    */
    getEncoding(resource: URI): string;
    /**
    * Get the properties for decoding the provided `resource` based on configuration.
    */
    resolveDecoding(resource: URI | undefined, options?: IReadTextFileEncodingOptions): Promise<{
        preferredEncoding: string;
        guessEncoding: boolean;
        candidateGuessEncodings: string[];
    }>;
    /**
    * Get the properties for encoding the provided `resource` based on configuration.
    */
    resolveEncoding(resource: URI | undefined, options?: IWriteTextFileOptions): Promise<{
        encoding: string;
        addBOM: boolean;
    }>;
    /**
    * Given a detected encoding, validate it against the configured encoding options.
    */
    validateDetectedEncoding(resource: URI | undefined, detectedEncoding: string, options?: IReadTextFileEncodingOptions): Promise<string>;
}
