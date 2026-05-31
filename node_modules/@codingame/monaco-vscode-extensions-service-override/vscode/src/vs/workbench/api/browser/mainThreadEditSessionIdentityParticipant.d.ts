import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IEditSessionIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/editSessions.service";
export declare class EditSessionIdentityCreateParticipant {
    private readonly _editSessionIdentityService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _editSessionIdentityService: IEditSessionIdentityService);
    dispose(): void;
}
