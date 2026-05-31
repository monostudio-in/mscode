import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { IWebContentExtractorOptions, WebContentExtractResult } from "./webContentExtractor.js";
export declare const IWebContentExtractorService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWebContentExtractorService>;
export interface IWebContentExtractorService {
    _serviceBrand: undefined;
    extract(uri: URI[], options?: IWebContentExtractorOptions): Promise<WebContentExtractResult[]>;
}
export declare const ISharedWebContentExtractorService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISharedWebContentExtractorService>;
export interface ISharedWebContentExtractorService {
    _serviceBrand: undefined;
    readImage(uri: URI, token: CancellationToken): Promise<VSBuffer | undefined>;
}
