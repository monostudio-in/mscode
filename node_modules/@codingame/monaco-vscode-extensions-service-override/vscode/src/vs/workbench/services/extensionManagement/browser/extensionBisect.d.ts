import { ILocalExtension } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionManagement";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { IExtension } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { IExtensionBisectService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/browser/extensionBisect.service";
export declare class ExtensionBisectService implements IExtensionBisectService {
    private readonly _storageService;
    private readonly _envService;
    readonly _serviceBrand: undefined;
    private static readonly _storageKey;
    private readonly _state;
    private readonly _disabled;
    constructor(logService: ILogService, _storageService: IStorageService, _envService: IWorkbenchEnvironmentService);
    get isActive(): boolean;
    get disabledCount(): number;
    isDisabledByBisect(extension: IExtension): boolean;
    private _isEnabledInEnv;
    start(extensions: ILocalExtension[]): Promise<void>;
    next(seeingBad: boolean): Promise<{
        id: string;
        bad: boolean;
    } | undefined>;
    reset(): Promise<void>;
}
