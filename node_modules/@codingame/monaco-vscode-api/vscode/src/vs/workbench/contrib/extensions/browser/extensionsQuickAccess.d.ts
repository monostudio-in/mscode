import { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.service.js";
import { IExtensionGalleryService } from "../../../../platform/extensionManagement/common/extensionManagement.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IExtensionsWorkbenchService } from "../common/extensions.service.js";
export declare class InstallExtensionQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly extensionsWorkbenchService;
    private readonly galleryService;
    private readonly extensionsService;
    private readonly notificationService;
    private readonly logService;
    static PREFIX: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, galleryService: IExtensionGalleryService, extensionsService: IExtensionManagementService, notificationService: INotificationService, logService: ILogService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Array<IPickerQuickAccessItem | IQuickPickSeparator> | Promise<Array<IPickerQuickAccessItem | IQuickPickSeparator>>;
    private getPicksForExtensionId;
    private installExtension;
}
export declare class ManageExtensionsQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly extensionsWorkbenchService;
    static PREFIX: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    protected _getPicks(): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
}
