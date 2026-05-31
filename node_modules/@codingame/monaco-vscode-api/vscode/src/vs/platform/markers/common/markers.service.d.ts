import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IMarker, IMarkerData, IMarkerReadOptions, IResourceMarker, MarkerStatistics } from "./markers.js";
export declare const IMarkerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMarkerService>;
export interface IMarkerService {
    readonly _serviceBrand: undefined;
    getStatistics(): MarkerStatistics;
    changeOne(owner: string, resource: URI, markers: IMarkerData[]): void;
    changeAll(owner: string, data: IResourceMarker[]): void;
    remove(owner: string, resources: URI[]): void;
    read(filter?: IMarkerReadOptions): IMarker[];
    installResourceFilter(resource: URI, reason: string): IDisposable;
    readonly onMarkerChanged: Event<readonly URI[]>;
}
