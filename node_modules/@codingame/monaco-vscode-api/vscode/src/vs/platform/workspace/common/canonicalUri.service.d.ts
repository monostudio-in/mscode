import { IDisposable } from "../../../base/common/lifecycle.js";
import { ICanonicalUriProvider } from "./canonicalUri.js";
export declare const ICanonicalUriService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ICanonicalUriService>;
export interface ICanonicalUriService {
    readonly _serviceBrand: undefined;
    registerCanonicalUriProvider(provider: ICanonicalUriProvider): IDisposable;
}
