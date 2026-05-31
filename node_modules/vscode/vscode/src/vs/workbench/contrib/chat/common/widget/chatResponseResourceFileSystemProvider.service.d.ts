import { URI } from "../../../../../base/common/uri.js";
import { IFileSystemProvider } from "../../../../../platform/files/common/files.js";
export declare const IChatResponseResourceFileSystemProvider: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatResponseResourceFileSystemProvider>;
export interface IChatResponseResourceFileSystemProvider extends IFileSystemProvider {
    readonly _serviceBrand: undefined;
    /**
    * Associates arbitrary data with a URI in the chat response resource filesystem.
    * The data is scoped to the given session and automatically cleaned up when
    * the session is disposed.
    * Returns a URI that can later be read via the file service.
    */
    associate(sessionResource: URI, data: Uint8Array | {
        base64: string;
    }, name?: string): URI;
}
