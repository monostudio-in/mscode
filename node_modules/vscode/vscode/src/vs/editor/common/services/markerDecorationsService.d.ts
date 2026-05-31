import { IMarker } from "../../../platform/markers/common/markers.js";
import { IMarkerService } from "../../../platform/markers/common/markers.service.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ITextModel, IModelDecoration } from "../model.js";
import { IModelService } from "./model.service.js";
import { Range } from "../core/range.js";
import { IMarkerDecorationsService } from "./markerDecorations.service.js";
import { Event } from "../../../base/common/event.js";
export declare class MarkerDecorationsService extends Disposable implements IMarkerDecorationsService {
    private readonly _markerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeMarker;
    readonly onDidChangeMarker: Event<ITextModel>;
    private readonly _suppressedRanges;
    private readonly _markerDecorations;
    constructor(modelService: IModelService, _markerService: IMarkerService);
    dispose(): void;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [
        Range,
        IMarker
    ][];
    addMarkerSuppression(uri: URI, range: Range): IDisposable;
    private _handleMarkerChange;
    private _onModelAdded;
    private _onModelRemoved;
    private _updateDecorations;
}
