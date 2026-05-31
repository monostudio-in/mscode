import { Event } from "../../../base/common/event.js";
import Severity from "../../../base/common/severity.js";
import { NotificationsFilter, INotificationSourceFilter, INotificationSource, INotification, INotificationHandle, NotificationMessage, IPromptChoice, IPromptChoiceWithMenu, IPromptOptions, IStatusMessageOptions, IStatusHandle } from "./notification.js";
export declare const INotificationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<INotificationService>;
/**
* A service to bring up notifications and non-modal prompts.
*
* Note: use the `IDialogService` for a modal way to ask the user for input.
*/
export interface INotificationService {
    readonly _serviceBrand: undefined;
    /**
    * Emitted when the notifications filter changed.
    */
    readonly onDidChangeFilter: Event<void>;
    /**
    * Sets a notification filter either for all notifications
    * or for a specific source.
    */
    setFilter(filter: NotificationsFilter | INotificationSourceFilter): void;
    /**
    * Gets the notification filter either for all notifications
    * or for a specific source.
    */
    getFilter(source?: INotificationSource): NotificationsFilter;
    /**
    * Returns all filters with their sources.
    */
    getFilters(): INotificationSourceFilter[];
    /**
    * Removes a filter for a specific source.
    */
    removeFilter(sourceId: string): void;
    /**
    * Show the provided notification to the user. The returned `INotificationHandle`
    * can be used to control the notification afterwards.
    *
    * **Note:** If your intent is to show a message with actions to the user, consider
    * the `INotificationService.prompt()` method instead which are optimized for
    * this usecase and much easier to use!
    *
    * @returns a handle on the notification to e.g. hide it or update message, buttons, etc.
    */
    notify(notification: INotification): INotificationHandle;
    /**
    * A convenient way of reporting infos. Use the `INotificationService.notify`
    * method if you need more control over the notification.
    */
    info(message: NotificationMessage | NotificationMessage[]): void;
    /**
    * A convenient way of reporting warnings. Use the `INotificationService.notify`
    * method if you need more control over the notification.
    */
    warn(message: NotificationMessage | NotificationMessage[]): void;
    /**
    * A convenient way of reporting errors. Use the `INotificationService.notify`
    * method if you need more control over the notification.
    */
    error(message: NotificationMessage | NotificationMessage[]): void;
    /**
    * Shows a prompt in the notification area with the provided choices. The prompt
    * is non-modal. If you want to show a modal dialog instead, use `IDialogService`.
    *
    * @param severity the severity of the notification. Either `Info`, `Warning` or `Error`.
    * @param message the message to show as status.
    * @param choices options to be chosen from.
    * @param options provides some optional configuration options.
    *
    * @returns a handle on the notification to e.g. hide it or update message, buttons, etc.
    */
    prompt(severity: Severity, message: string, choices: (IPromptChoice | IPromptChoiceWithMenu)[], options?: IPromptOptions): INotificationHandle;
    /**
    * Shows a status message in the status area with the provided text.
    *
    * @param message the message to show as status
    * @param options provides some optional configuration options
    *
    * @returns a handle to hide the status message
    */
    status(message: NotificationMessage, options?: IStatusMessageOptions): IStatusHandle;
}
