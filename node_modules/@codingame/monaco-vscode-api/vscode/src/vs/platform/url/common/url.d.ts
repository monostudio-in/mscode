import { URI } from "../../../base/common/uri.js";
export interface IOpenURLOptions {
    /**
     * If not provided or `false`, signals that the
     * URL to open did not originate from the product
     * but outside. As such, a confirmation dialog
     * might be shown to the user.
     */
    trusted?: boolean;
    originalUrl?: string;
}
export interface IURLHandler {
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
