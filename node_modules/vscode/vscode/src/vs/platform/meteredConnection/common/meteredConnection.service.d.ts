import { Event } from "../../../base/common/event.js";
export declare const IMeteredConnectionService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMeteredConnectionService>;
/**
* Service to report on metered connection status.
*/
export interface IMeteredConnectionService {
    readonly _serviceBrand: undefined;
    /**
    * Whether the current network connection is metered.
    * Always returns `false` if the `network.meteredConnection` setting is `off`.
    * Always returns `true` if the `network.meteredConnection` setting is `on`.
    */
    readonly isConnectionMetered: boolean;
    /**
    * Event that fires when the metered connection status changes.
    */
    readonly onDidChangeIsConnectionMetered: Event<boolean>;
}
