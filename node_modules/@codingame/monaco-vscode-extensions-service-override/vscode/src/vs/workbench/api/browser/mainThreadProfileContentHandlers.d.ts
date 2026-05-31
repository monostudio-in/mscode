import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadProfileContentHandlersShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IUserDataProfileImportExportService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userDataProfile/common/userDataProfile.service";
export declare class MainThreadProfileContentHandlers extends Disposable implements MainThreadProfileContentHandlersShape {
    private readonly userDataProfileImportExportService;
    private readonly proxy;
    private readonly registeredHandlers;
    constructor(context: IExtHostContext, userDataProfileImportExportService: IUserDataProfileImportExportService);
    $registerProfileContentHandler(id: string, name: string, description: string | undefined, extensionId: string): Promise<void>;
    $unregisterProfileContentHandler(id: string): Promise<void>;
}
