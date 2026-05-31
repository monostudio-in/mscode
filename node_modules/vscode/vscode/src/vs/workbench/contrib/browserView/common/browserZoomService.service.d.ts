import { Event } from "../../../../base/common/event.js";
import { IBrowserZoomChangeEvent } from "./browserZoomService.js";
export declare const IBrowserZoomService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserZoomService>;
/**
* Manages two independent cascading zoom hierarchies for integrated browser views:
*
*  Normal views:    `persistent per-host override` ?? `configured default`
*  Ephemeral views: `ephemeral per-host override`  ?? `configured default`
*
* Ephemeral views never see persistent overrides directly. Instead, when a persistent
* value changes, it is copied into the ephemeral map so that ephemeral views
* immediately reflect the new level. Conversely, ephemeral changes never affect
* normal views.
*
* Per-host values that equal the current default are always removed (both persistent
* and ephemeral), so the view tracks the default going forward.
*/
export interface IBrowserZoomService {
    readonly _serviceBrand: undefined;
    /** Fired whenever the effective zoom for a host may have changed. */
    readonly onDidChangeZoom: Event<IBrowserZoomChangeEvent>;
    /**
    * Returns the effective zoom index for the given host and session type.
    * Pass `host = undefined` to obtain only the configured default zoom index.
    */
    getEffectiveZoomIndex(host: string | undefined, isEphemeral: boolean): number;
    /**
    * Set the zoom for a host.
    *
    * Non-ephemeral: persisted to storage. Also propagated into
    * the ephemeral map so ephemeral views immediately reflect the change.
    *
    * Ephemeral: stored in memory only, dropped on restart.
    *
    * In both cases, if the value equals the current default, the entry is removed so the
    * view tracks the default going forward.
    */
    setHostZoomIndex(host: string, zoomIndex: number, isEphemeral: boolean): void;
    /**
    * Notifies the service of the application's current UI zoom factor.
    * Must be called once on startup and again whenever the window zoom changes.
    * Only relevant when the default zoom level is set to `MATCH_WINDOW_LABEL`.
    */
    notifyWindowZoomChanged(windowZoomFactor: number): void;
}
