import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../common/core/position.js";
import { ITextModel } from "../../../common/model.js";
import { IMarker } from "../../../../platform/markers/common/markers.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IMarkerNavigationService } from "./markerNavigationService.service.js";
export declare class MarkerCoordinate {
    readonly marker: IMarker;
    readonly index: number;
    readonly total: number;
    constructor(marker: IMarker, index: number, total: number);
}
export declare class MarkerList {
    private readonly _markerService;
    private readonly _configService;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private readonly _resourceFilter?;
    private readonly _dispoables;
    private _markers;
    private _nextIdx;
    constructor(resourceFilter: URI | ((uri: URI) => boolean) | undefined, _markerService: IMarkerService, _configService: IConfigurationService);
    dispose(): void;
    matches(uri: URI | undefined): boolean;
    get selected(): MarkerCoordinate | undefined;
    private _initIdx;
    resetIndex(): void;
    move(fwd: boolean, model: ITextModel, position: Position): boolean;
    find(uri: URI, position: Position): MarkerCoordinate | undefined;
}
export interface IMarkerListProvider {
    getMarkerList(resource: URI | undefined): MarkerList | undefined;
}
export declare class MarkerNavigationService implements IMarkerNavigationService, IMarkerListProvider {
    private readonly _markerService;
    private readonly _configService;
    readonly _serviceBrand: undefined;
    private readonly _provider;
    constructor(_markerService: IMarkerService, _configService: IConfigurationService);
    registerProvider(provider: IMarkerListProvider): IDisposable;
    getMarkerList(resource: URI | undefined): MarkerList;
}
