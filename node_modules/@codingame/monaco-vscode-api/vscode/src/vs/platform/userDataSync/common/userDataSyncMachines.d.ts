import { Disposable } from "../../../base/common/lifecycle.js";
import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IFileService } from "../../files/common/files.service.js";
import { IProductService } from "../../product/common/productService.service.js";
import { IStorageService } from "../../storage/common/storage.service.js";
import { IUserDataManifest } from "./userDataSync.js";
import { IUserDataSyncLogService } from "./userDataSync.service.js";
import { IUserDataSyncStoreService } from "./userDataSync.service.js";
import { IUserDataSyncMachinesService } from "./userDataSyncMachines.service.js";
export interface IMachineData {
    id: string;
    name: string;
    disabled?: boolean;
    platform?: string;
}
export interface IMachinesData {
    version: number;
    machines: IMachineData[];
}
export type IUserDataSyncMachine = Readonly<IMachineData> & {
    readonly isCurrent: boolean;
};
export declare function isWebPlatform(platform: string): boolean;
export declare class UserDataSyncMachinesService extends Disposable implements IUserDataSyncMachinesService {
    private readonly storageService;
    private readonly userDataSyncStoreService;
    private readonly logService;
    private readonly productService;
    private static readonly VERSION;
    private static readonly RESOURCE;
    _serviceBrand: undefined;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../base/common/event.js").Event<void>;
    private readonly currentMachineIdPromise;
    private userData;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService, productService: IProductService);
    getMachines(manifest?: IUserDataManifest): Promise<IUserDataSyncMachine[]>;
    addCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    removeCurrentMachine(manifest?: IUserDataManifest): Promise<void>;
    renameMachine(machineId: string, name: string, manifest?: IUserDataManifest): Promise<void>;
    setEnablements(enablements: [
        string,
        boolean
    ][]): Promise<void>;
    private computeCurrentMachineName;
    private readMachinesData;
    private writeMachinesData;
    private readUserData;
    private parse;
}
