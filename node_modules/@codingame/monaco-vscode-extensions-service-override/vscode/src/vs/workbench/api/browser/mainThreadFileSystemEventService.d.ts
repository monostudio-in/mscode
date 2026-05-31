import { IWatchOptions } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadFileSystemEventServiceShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IWorkingCopyFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService.service";
import { IBulkEditService } from "@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/bulkEditService.service";
import { IProgressService } from "@codingame/monaco-vscode-api/vscode/vs/platform/progress/common/progress.service";
import { IDialogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export declare class MainThreadFileSystemEventService implements MainThreadFileSystemEventServiceShape {
    private readonly _fileService;
    private readonly _logService;
    static readonly MementoKeyAdditionalEdits = "file.particpants.additionalEdits";
    private readonly _proxy;
    private readonly _listener;
    private readonly _watches;
    constructor(extHostContext: IExtHostContext, _fileService: IFileService, workingCopyFileService: IWorkingCopyFileService, bulkEditService: IBulkEditService, progressService: IProgressService, dialogService: IDialogService, storageService: IStorageService, logService: ILogService, envService: IEnvironmentService, uriIdentService: IUriIdentityService, _logService: ILogService);
    $watch(extensionId: string, session: number, resource: UriComponents, unvalidatedOpts: IWatchOptions, correlate: boolean): Promise<void>;
    $unwatch(session: number): void;
    dispose(): void;
}
