import { Disposable } from "../../../base/common/lifecycle.js";
import { Event } from "../../../base/common/event.js";
import { ViewContainerLocation } from "../../common/views.js";
import { IViewDescriptorService } from "../../common/views.service.js";
/**
 * Tracks the number of visible view containers at a given location.
 * A view container is considered visible if it has active views (activeViewDescriptors.length > 0).
 * Fires an event when the number of visible containers changes.
 */
export declare class VisibleViewContainersTracker extends Disposable {
    private readonly location;
    private readonly viewDescriptorService;
    private readonly viewContainerModelListeners;
    private readonly _onDidChange;
    readonly onDidChange: Event<{
        before: number;
        after: number;
    }>;
    private _visibleCount;
    constructor(location: ViewContainerLocation, viewDescriptorService: IViewDescriptorService);
    /**
     * Returns the current number of visible view containers at this location.
     */
    get visibleCount(): number;
    private registerListeners;
    private initializeViewContainerListeners;
    private addViewContainerModelListener;
    private updateVisibleCount;
}
