import { URI } from "../../../base/common/uri.js";
import { TargetPlatform } from "../../extensions/common/extensions.js";
export declare const IExtensionResourceLoaderService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionResourceLoaderService>;
/**
* A service useful for reading resources from within extensions.
*/
export interface IExtensionResourceLoaderService {
    readonly _serviceBrand: undefined;
    /**
    * Read a certain resource within an extension.
    */
    readExtensionResource(uri: URI): Promise<string>;
    /**
    * Returns whether the gallery provides extension resources.
    */
    supportsExtensionGalleryResources(): Promise<boolean>;
    /**
    * Return true if the given URI is a extension gallery resource.
    */
    isExtensionGalleryResource(uri: URI): Promise<boolean>;
    /**
    * Computes the URL of a extension gallery resource. Returns `undefined` if gallery does not provide extension resources.
    */
    getExtensionGalleryResourceURL(galleryExtension: {
        publisher: string;
        name: string;
        version: string;
        targetPlatform?: TargetPlatform;
    }, path?: string): Promise<URI | undefined>;
}
