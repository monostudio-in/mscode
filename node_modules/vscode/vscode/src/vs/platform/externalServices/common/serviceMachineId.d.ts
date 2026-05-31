import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IFileService } from "../../files/common/files.service.js";
import { IStorageService } from "../../storage/common/storage.service.js";
export declare function getServiceMachineId(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService | undefined): Promise<string>;
