import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { IWebContentExtractorService, type ISharedWebContentExtractorService } from "./webContentExtractor.service.js";
export interface IWebContentExtractorOptions {
    /**
     * Whether to allow cross-authority redirects on the web content.
     * 'false' by default.
     */
    followRedirects?: boolean;
    /**
     * List of trusted domain patterns for redirect validation.
     */
    trustedDomains?: string[];
}
export type WebContentExtractResult = {
    status: "ok";
    result: string;
    title?: string;
} | {
    status: "error";
    error: string;
    statusCode?: number;
    result?: string;
    title?: string;
} | {
    status: "redirect";
    toURI: URI;
};
/**
 * A service that extracts web content from a given URI.
 * This is a placeholder implementation that does not perform any actual extraction.
 * It's intended to be used on platforms where web content extraction is not supported such as in the browser.
 */
export declare class NullWebContentExtractorService implements IWebContentExtractorService {
    _serviceBrand: undefined;
    extract(_uri: URI[]): Promise<WebContentExtractResult[]>;
}
export declare class NullSharedWebContentExtractorService implements ISharedWebContentExtractorService {
    _serviceBrand: undefined;
    readImage(_uri: URI, _token: CancellationToken): Promise<VSBuffer | undefined>;
}
