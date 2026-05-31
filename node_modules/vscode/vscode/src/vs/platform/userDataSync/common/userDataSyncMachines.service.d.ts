import { Event } from "../../../base/common/event.js";
import { IUserDataManifest } from "./userDataSync.js";
import { IUserDataSyncMachine } from "./userDataSyncMachines.js";
export declare const IUserDataSyncMachinesService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncMachinesService>;
export interface IUserDataSyncMachinesService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    getMachines(manifest?: IUserDataManifest): Promise<IUserDataSyncMachine[]>;
    addCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    removeCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    renameMachine(machineId: string, name: string): Promise<void>;
    setEnablements(enbalements: [
        string,
        boolean
    ][]): Promise<void>;
}
