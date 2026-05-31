import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IMultiDiffSourceResolver, IResolvedMultiDiffSource } from "./multiDiffSourceResolverService.js";
export declare const IMultiDiffSourceResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMultiDiffSourceResolverService>;
export interface IMultiDiffSourceResolverService {
    readonly _serviceBrand: undefined;
    registerResolver(resolver: IMultiDiffSourceResolver): IDisposable;
    resolve(uri: URI): Promise<IResolvedMultiDiffSource | undefined>;
}
