import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IRemoteExplorerService } from "../../../services/remote/common/remoteExplorerService.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.service.js";
import { INotificationService } from "../../../../platform/notification/common/notification.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { ITerminalService } from "../../terminal/browser/terminal.service.js";
import { IDebugService } from "../../debug/common/debug.service.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.service.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.service.js";
import { IActivityService } from "../../../services/activity/common/activity.service.js";
import { IExternalUriOpenerService } from "../../externalUriOpener/common/externalUriOpenerService.service.js";
import { IHostService } from "../../../services/host/browser/host.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.service.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
export declare const VIEWLET_ID = "workbench.view.remote";
export declare class ForwardedPortsView extends Disposable implements IWorkbenchContribution {
    private readonly contextKeyService;
    private readonly environmentService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly activityService;
    private readonly statusbarService;
    private readonly contextKeyListener;
    private readonly activityBadge;
    private entryAccessor;
    private hasPortsInSession;
    constructor(contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService, remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, activityService: IActivityService, statusbarService: IStatusbarService);
    private getViewContainer;
    private enableForwardedPortsFeatures;
    private enableBadgeAndStatusBar;
    private updateActivityBadge;
    private updateStatusBar;
    private get entry();
}
export declare class PortRestore implements IWorkbenchContribution {
    private readonly remoteExplorerService;
    private readonly logService;
    constructor(remoteExplorerService: IRemoteExplorerService, logService: ILogService);
    private restore;
}
export declare class AutomaticPortForwarding extends Disposable implements IWorkbenchContribution {
    private readonly terminalService;
    private readonly notificationService;
    private readonly openerService;
    private readonly externalOpenerService;
    private readonly remoteExplorerService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly debugService;
    private readonly tunnelService;
    private readonly hostService;
    private readonly logService;
    private readonly storageService;
    private readonly preferencesService;
    private procForwarder;
    private outputForwarder;
    private portListener;
    constructor(terminalService: ITerminalService, notificationService: INotificationService, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IWorkbenchConfigurationService, debugService: IDebugService, remoteAgentService: IRemoteAgentService, tunnelService: ITunnelService, hostService: IHostService, logService: ILogService, storageService: IStorageService, preferencesService: IPreferencesService);
    private getPortAutoFallbackNumber;
    private listenForPorts;
    private setup;
}
