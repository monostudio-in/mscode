import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ITextFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/textfile/common/textfiles.service";
export declare class SaveParticipant {
    private readonly _textFileService;
    private _saveParticipantDisposable;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _textFileService: ITextFileService);
    dispose(): void;
}
