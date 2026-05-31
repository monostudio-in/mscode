import { Event } from "../../../base/common/event.js";
import { State } from "./update.js";
export declare const IUpdateService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUpdateService>;
export interface IUpdateService {
    readonly _serviceBrand: undefined;
    readonly onStateChange: Event<State>;
    readonly state: State;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(explicit: boolean): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    /**
    * @deprecated This method should not be used any more. It will be removed in a future release.
    */
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    setInternalOrg(internalOrg: string | undefined): Promise<void>;
}
