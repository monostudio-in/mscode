import { INotificationsModel } from "../../../common/notifications.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.service.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
export declare class NotificationsStatus extends Disposable {
    private readonly model;
    private readonly statusbarService;
    private readonly notificationService;
    private readonly configurationService;
    private notificationsCenterStatusItem;
    private newNotificationsCount;
    private currentStatusMessage;
    private isNotificationsCenterVisible;
    private isNotificationsToastsVisible;
    private currentAlignment;
    constructor(model: INotificationsModel, statusbarService: IStatusbarService, notificationService: INotificationService, configurationService: IConfigurationService);
    private registerListeners;
    private onDidChangeNotification;
    private updateNotificationsCenterStatusItem;
    private getDesiredAlignment;
    private getTooltip;
    update(isCenterVisible: boolean, isToastsVisible: boolean): void;
    private onDidChangeStatusMessage;
    private doSetStatusMessage;
}
