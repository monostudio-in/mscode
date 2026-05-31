import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IOpener, IValidator, IExternalUriResolver, IExternalOpener, OpenInternalOptions, OpenExternalOptions, ResolveExternalUriOptions, IResolvedExternalUri } from "./opener.js";
export declare const IOpenerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IOpenerService>;
export interface IOpenerService {
    readonly _serviceBrand: undefined;
    /**
    * Register a participant that can handle the open() call.
    */
    registerOpener(opener: IOpener): IDisposable;
    /**
    * Register a participant that can validate if the URI resource be opened.
    * Validators are run before openers.
    */
    registerValidator(validator: IValidator): IDisposable;
    /**
    * Register a participant that can resolve an external URI resource to be opened.
    */
    registerExternalUriResolver(resolver: IExternalUriResolver): IDisposable;
    /**
    * Sets the handler for opening externally. If not provided,
    * a default handler will be used.
    */
    setDefaultExternalOpener(opener: IExternalOpener): void;
    /**
    * Registers a new opener external resources openers.
    */
    registerExternalOpener(opener: IExternalOpener): IDisposable;
    /**
    * Opens a resource, like a webaddress, a document uri, or executes command.
    *
    * @param resource A resource
    * @return A promise that resolves when the opening is done.
    */
    open(resource: URI | string, options?: OpenInternalOptions | OpenExternalOptions): Promise<boolean>;
    /**
    * Resolve a resource to its external form.
    * @throws whenever resolvers couldn't resolve this resource externally.
    */
    resolveExternalUri(resource: URI, options?: ResolveExternalUriOptions): Promise<IResolvedExternalUri>;
}
