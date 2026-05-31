import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IWorkingCopyFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService.service";
export declare class SaveParticipant {
    private readonly workingCopyFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, workingCopyFileService: IWorkingCopyFileService);
    dispose(): void;
}
