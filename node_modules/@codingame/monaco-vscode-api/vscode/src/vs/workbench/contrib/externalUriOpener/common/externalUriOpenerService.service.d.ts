import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IExternalOpenerProvider, IExternalUriOpener } from "./externalUriOpenerService.js";
export declare const IExternalUriOpenerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExternalUriOpenerService>;
export interface IExternalUriOpenerService {
    readonly _serviceBrand: undefined;
    /**
    * Registers a provider for external resources openers.
    */
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    /**
    * Get the configured IExternalUriOpener for the uri.
    * If there is no opener configured, then returns the first opener that can handle the uri.
    */
    getOpener(uri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
}
