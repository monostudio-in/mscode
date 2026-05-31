import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IMarker, IMarkerData, IMarkerReadOptions, IResourceMarker, MarkerStatistics } from "./markers.js";
import { IMarkerService } from "./markers.service.js";
export declare const unsupportedSchemas: Set<string>;
export declare class MarkerService implements IMarkerService {
    readonly _serviceBrand: undefined;
    private readonly _onMarkerChanged;
    readonly onMarkerChanged: import("../../../base/common/event.js").Event<readonly URI[]>;
    private readonly _data;
    private readonly _stats;
    private readonly _filteredResources;
    dispose(): void;
    getStatistics(): MarkerStatistics;
    remove(owner: string, resources: URI[]): void;
    changeOne(owner: string, resource: URI, markerData: IMarkerData[]): void;
    installResourceFilter(resource: URI, reason: string): IDisposable;
    private static _toMarker;
    changeAll(owner: string, data: IResourceMarker[]): void;
    /**
     * Creates an information marker for filtered resources
     */
    private _createFilteredMarker;
    read(filter?: IMarkerReadOptions): IMarker[];
    private static _accept;
    private static _merge;
}
