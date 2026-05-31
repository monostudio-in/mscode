import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { TextSearchCompleteMessage } from "../../../services/search/common/searchExtTypes.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
export declare const renderSearchMessage: (message: TextSearchCompleteMessage, instantiationService: IInstantiationService, notificationService: INotificationService, openerService: IOpenerService, commandService: ICommandService, disposableStore: DisposableStore, triggerSearch: () => void) => HTMLElement;
