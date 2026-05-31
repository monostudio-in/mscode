import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ViewContainer } from "../../../common/views.js";
import { IActivity } from "./activity.js";
export declare const IActivityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IActivityService>;
export interface IActivityService {
    readonly _serviceBrand: undefined;
    /**
    * Emitted when activity changes for a view container or when the activity of the global actions change.
    */
    readonly onDidChangeActivity: Event<string | ViewContainer>;
    /**
    * Show activity for the given view container
    */
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    /**
    * Returns the activity for the given view container
    */
    getViewContainerActivities(viewContainerId: string): IActivity[];
    /**
    * Show activity for the given view
    */
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    /**
    * Show accounts activity
    */
    showAccountsActivity(activity: IActivity): IDisposable;
    /**
    * Show global activity
    */
    showGlobalActivity(activity: IActivity): IDisposable;
    /**
    * Return the activity for the given action
    */
    getActivity(id: string): IActivity[];
}
