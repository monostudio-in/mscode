import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IURLHandler, IOpenURLOptions } from "../../../../platform/url/common/url.js";
import { IURLService } from "../../../../platform/url/common/url.service.js";
import { IHostService } from "../../host/browser/host.service.js";
import { IExtensionService } from "../common/extensions.service.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IProductService } from "../../../../platform/product/common/productService.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IExtensionUrlHandler } from "./extensionUrlHandler.service.js";
export interface IExtensionContributedURLHandler extends IURLHandler {
    extensionDisplayName: string;
}
export interface IExtensionUrlHandlerOverride {
    canHandleURL(uri: URI): boolean;
    handleURL(uri: URI): Promise<boolean>;
}
export declare class ExtensionUrlHandlerOverrideRegistry {
    private static readonly handlers;
    static registerHandler(handler: IExtensionUrlHandlerOverride): IDisposable;
    static getHandler(uri: URI): IExtensionUrlHandlerOverride | undefined;
}
/**
 * This class handles URLs which are directed towards extensions.
 * If a URL is directed towards an inactive extension, it buffers it,
 * activates the extension and re-opens the URL once the extension registers
 * a URL handler. If the extension never registers a URL handler, the urls
 * will eventually be garbage collected.
 *
 * It also makes sure the user confirms opening URLs directed towards extensions.
 */
export declare class ExtensionUrlHandler implements IExtensionUrlHandler, IURLHandler {
    private readonly extensionService;
    private readonly dialogService;
    private readonly commandService;
    private readonly hostService;
    private readonly storageService;
    private readonly configurationService;
    private readonly notificationService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private extensionHandlers;
    private uriBuffer;
    private userTrustedExtensionsStorage;
    private disposable;
    constructor(urlService: IURLService, extensionService: IExtensionService, dialogService: IDialogService, commandService: ICommandService, hostService: IHostService, storageService: IStorageService, configurationService: IConfigurationService, notificationService: INotificationService, productService: IProductService);
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
    registerExtensionHandler(extensionId: ExtensionIdentifier, handler: IExtensionContributedURLHandler): void;
    unregisterExtensionHandler(extensionId: ExtensionIdentifier): void;
    private handleURLByExtension;
    private handleUnhandledURL;
    private garbageCollect;
    private didUserTrustExtension;
    private getConfirmedTrustedExtensionIdsFromConfiguration;
    dispose(): void;
}
