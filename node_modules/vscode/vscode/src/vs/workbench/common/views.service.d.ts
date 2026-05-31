import { Event } from "../../base/common/event.js";
import { ViewContainer, ViewContainerLocation, IViewContainerModel, IViewDescriptor, ViewVisibilityState } from "./views.js";
export declare const IViewDescriptorService: import("../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IViewDescriptorService>;
export interface IViewDescriptorService {
    readonly _serviceBrand: undefined;
    readonly viewContainers: ReadonlyArray<ViewContainer>;
    readonly onDidChangeViewContainers: Event<{
        added: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
        removed: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
    }>;
    getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined;
    getViewContainerById(id: string): ViewContainer | null;
    isViewContainerRemovedPermanently(id: string): boolean;
    getDefaultViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation | null;
    getViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation | null;
    getViewContainersByLocation(location: ViewContainerLocation): ViewContainer[];
    getViewContainerModel(viewContainer: ViewContainer): IViewContainerModel;
    readonly onDidChangeContainerLocation: Event<{
        viewContainer: ViewContainer;
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    moveViewContainerToLocation(viewContainer: ViewContainer, location: ViewContainerLocation, requestedIndex?: number, reason?: string): void;
    getViewContainerBadgeEnablementState(id: string): boolean;
    setViewContainerBadgeEnablementState(id: string, badgesEnabled: boolean): void;
    getViewDescriptorById(id: string): IViewDescriptor | null;
    getViewContainerByViewId(id: string): ViewContainer | null;
    getDefaultContainerById(id: string): ViewContainer | null;
    getViewLocationById(id: string): ViewContainerLocation | null;
    canMoveViews(): boolean;
    readonly onDidChangeContainer: Event<{
        views: IViewDescriptor[];
        from: ViewContainer;
        to: ViewContainer;
    }>;
    moveViewsToContainer(views: IViewDescriptor[], viewContainer: ViewContainer, visibilityState?: ViewVisibilityState, reason?: string): void;
    readonly onDidChangeLocation: Event<{
        views: IViewDescriptor[];
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    moveViewToLocation(view: IViewDescriptor, location: ViewContainerLocation, reason?: string): void;
    reset(): void;
}
