import { IDisposable } from "../../../base/common/lifecycle.js";
import { UriComponents, URI } from "../../../base/common/uri.js";
import { IOpenURLOptions, IURLHandler } from "./url.js";
export declare const IURLService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IURLService>;
export interface IURLService {
    readonly _serviceBrand: undefined;
    /**
    * Create a URL that can be called to trigger IURLhandlers.
    * The URL that gets passed to the IURLHandlers carries over
    * any of the provided IURLCreateOption values.
    */
    create(options?: Partial<UriComponents>): URI;
    open(url: URI, options?: IOpenURLOptions): Promise<boolean>;
    registerHandler(handler: IURLHandler): IDisposable;
}
