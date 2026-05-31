import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IBrowserZoomService } from "./browserZoomService.service.js";
/**
 * Special value for the default zoom level setting that instructs the browser view
 * to dynamically match the closest zoom level to the application's current UI zoom.
 */
export declare const MATCH_WINDOW_ZOOM_LABEL = "Match Window";
export interface IBrowserZoomChangeEvent {
    /**
     * The host (e.g. `"example.com"`) whose zoom changed, or `undefined`
     * when the global default zoom level changed.
     */
    readonly host: string | undefined;
    /**
     * Whether the change came from an ephemeral session.
     * - `true`  → only ephemeral views need to react.
     * - `false` → all views (ephemeral and non-ephemeral) for the host may be affected.
     */
    readonly isEphemeralChange: boolean;
}
export declare class BrowserZoomService extends Disposable implements IBrowserZoomService {
    private readonly configurationService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeZoom;
    readonly onDidChangeZoom: Event<IBrowserZoomChangeEvent>;
    /**
     * In-memory cache of the persistent per-host map.
     * Backed by IStorageService.
     */
    private _persistentZoomMap;
    /** In-memory only; dropped on restart. */
    private readonly _ephemeralZoomMap;
    private _windowZoomFactor;
    constructor(configurationService: IConfigurationService, storageService: IStorageService);
    getEffectiveZoomIndex(host: string | undefined, isEphemeral: boolean): number;
    setHostZoomIndex(host: string, zoomIndex: number, isEphemeral: boolean): void;
    notifyWindowZoomChanged(windowZoomFactor: number): void;
    private _getDefaultZoomIndex;
    /**
     * Finds the browser zoom index whose factor is closest to the application's current UI zoom
     * factor, measuring distance on a log scale (since window zoom levels are powers of 1.2).
     */
    private _getMatchWindowZoomIndex;
    /**
     * Reads the persistent per-host zoom map from storage.
     * The stored format is a JSON object mapping host strings to zoom indices.
     */
    private _readPersistentZoomMap;
    private _writePersistentZoomMap;
    private _clamp;
}
