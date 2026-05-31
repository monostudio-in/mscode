import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { IOpenerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/opener/common/opener.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { MainThreadUriOpenersShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExternalOpenerProvider, IExternalUriOpener } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService";
import { IExternalUriOpenerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadUriOpeners extends Disposable implements MainThreadUriOpenersShape, IExternalOpenerProvider {
    private readonly extensionService;
    private readonly openerService;
    private readonly notificationService;
    private readonly proxy;
    private readonly _registeredOpeners;
    private readonly _contributedExternalUriOpenersStore;
    constructor(context: IExtHostContext, storageService: IStorageService, externalUriOpenerService: IExternalUriOpenerService, extensionService: IExtensionService, openerService: IOpenerService, notificationService: INotificationService);
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
    private createOpener;
    $registerUriOpener(id: string, schemes: readonly string[], extensionId: ExtensionIdentifier, label: string): Promise<void>;
    $unregisterUriOpener(id: string): Promise<void>;
    dispose(): void;
}
