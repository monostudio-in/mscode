import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IMarkerListProvider, MarkerList } from "./markerNavigationService.js";
export declare const IMarkerNavigationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMarkerNavigationService>;
export interface IMarkerNavigationService {
    readonly _serviceBrand: undefined;
    registerProvider(provider: IMarkerListProvider): IDisposable;
    getMarkerList(resource: URI | undefined): MarkerList;
}
