import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
export declare class ContributedExternalUriOpenersStore extends Disposable {
    private readonly _extensionService;
    private static readonly STORAGE_ID;
    private readonly _openers;
    private readonly _memento;
    private _mementoObject;
    constructor(storageService: IStorageService, _extensionService: IExtensionService);
    didRegisterOpener(id: string, extensionId: string): void;
    private add;
    delete(id: string): void;
    private invalidateOpenersOnExtensionsChanged;
    private updateSchema;
}
