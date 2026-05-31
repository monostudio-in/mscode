import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadDownloadServiceShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDownloadService } from "@codingame/monaco-vscode-api/vscode/vs/platform/download/common/download.service";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export declare class MainThreadDownloadService extends Disposable implements MainThreadDownloadServiceShape {
    private readonly downloadService;
    constructor(extHostContext: IExtHostContext, downloadService: IDownloadService);
    $download(uri: UriComponents, to: UriComponents): Promise<void>;
}
