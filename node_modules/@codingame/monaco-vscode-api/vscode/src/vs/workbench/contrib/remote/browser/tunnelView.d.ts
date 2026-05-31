import { IViewDescriptor } from "../../../common/views.js";
import { IViewDescriptorService } from "../../../common/views.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.service.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { ICommandHandler } from "../../../../platform/commands/common/commands.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { Event } from "../../../../base/common/event.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { IMenuService } from "../../../../platform/actions/common/actions.service.js";
import { ILocalizedString } from "../../../../platform/action/common/action.js";
import { TunnelType, ITunnelItem } from "../../../services/remote/common/remoteExplorerService.js";
import { IRemoteExplorerService } from "../../../services/remote/common/remoteExplorerService.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ViewPane, IViewPaneOptions } from "../../../browser/parts/views/viewPane.js";
import { URI } from "../../../../base/common/uri.js";
import { TunnelPrivacyId, TunnelProtocol } from "../../../../platform/tunnel/common/tunnel.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.service.js";
import { TunnelPrivacy } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IExternalUriOpenerService } from "../../externalUriOpener/common/externalUriOpenerService.service.js";
import { Tunnel, TunnelModel, TunnelSource } from "../../../services/remote/common/tunnelModel.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
export declare const openPreviewEnabledContext: RawContextKey<boolean>;
interface ITunnelViewModel {
    readonly onForwardedPortsChanged: Event<void>;
    readonly all: TunnelItem[];
    readonly input: TunnelItem;
    isEmpty(): boolean;
}
export declare class TunnelViewModel implements ITunnelViewModel {
    private readonly remoteExplorerService;
    private readonly tunnelService;
    readonly onForwardedPortsChanged: Event<void>;
    private model;
    private _candidates;
    readonly input: {
        label: string;
        icon: undefined;
        tunnelType: TunnelType;
        hasRunningProcess: boolean;
        remoteHost: string;
        remotePort: number;
        processDescription: string;
        tooltipPostfix: string;
        iconTooltip: string;
        portTooltip: string;
        processTooltip: string;
        originTooltip: string;
        privacyTooltip: string;
        source: {
            source: TunnelSource;
            description: string;
        };
        protocol: TunnelProtocol;
        privacy: {
            id: TunnelPrivacyId;
            themeIcon: string;
            label: string;
        };
        strip: () => undefined;
    };
    constructor(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService);
    get all(): TunnelItem[];
    private addProcessInfoFromCandidate;
    private get forwarded();
    private get detected();
    isEmpty(): boolean;
}
declare class TunnelItem implements ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    source: {
        source: TunnelSource;
        description: string;
    };
    hasRunningProcess: boolean;
    protocol: TunnelProtocol;
    localUri?: URI | undefined;
    localAddress?: string | undefined;
    localPort?: number | undefined;
    closeable?: boolean | undefined;
    name?: string | undefined;
    private runningProcess?;
    private pid?;
    private _privacy?;
    private remoteExplorerService?;
    private tunnelService?;
    static createFromTunnel(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, tunnel: Tunnel, type?: TunnelType, closeable?: boolean): TunnelItem;
    /**
     * Removes all non-serializable properties from the tunnel
     * @returns A new TunnelItem without any services
     */
    strip(): TunnelItem | undefined;
    constructor(tunnelType: TunnelType, remoteHost: string, remotePort: number, source: {
        source: TunnelSource;
        description: string;
    }, hasRunningProcess: boolean, protocol: TunnelProtocol, localUri?: URI | undefined, localAddress?: string | undefined, localPort?: number | undefined, closeable?: boolean | undefined, name?: string | undefined, runningProcess?: string | undefined, pid?: number | undefined, _privacy?: (TunnelPrivacyId | string) | undefined, remoteExplorerService?: IRemoteExplorerService | undefined, tunnelService?: ITunnelService | undefined);
    get label(): string;
    set processDescription(description: string | undefined);
    get processDescription(): string | undefined;
    get tooltipPostfix(): string;
    get iconTooltip(): string;
    get portTooltip(): string;
    get processTooltip(): string;
    get originTooltip(): string;
    get privacy(): TunnelPrivacy;
}
export declare class TunnelPanel extends ViewPane {
    protected viewModel: ITunnelViewModel;
    protected quickInputService: IQuickInputService;
    protected commandService: ICommandService;
    private readonly menuService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly contextViewService;
    static readonly ID = "~remote.forwardedPorts";
    static readonly TITLE: ILocalizedString;
    private panelContainer;
    private table;
    private readonly tableDisposables;
    private tunnelTypeContext;
    private tunnelCloseableContext;
    private tunnelPrivacyContext;
    private tunnelPrivacyEnabledContext;
    private tunnelProtocolContext;
    private tunnelViewFocusContext;
    private tunnelViewSelectionContext;
    private tunnelViewMultiSelectionContext;
    private portChangableContextKey;
    private protocolChangableContextKey;
    private isEditing;
    private titleActions;
    private lastFocus;
    constructor(viewModel: ITunnelViewModel, options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, quickInputService: IQuickInputService, commandService: ICommandService, menuService: IMenuService, themeService: IThemeService, remoteExplorerService: IRemoteExplorerService, hoverService: IHoverService, tunnelService: ITunnelService, contextViewService: IContextViewService);
    private registerPrivacyActions;
    get portCount(): number;
    private createTable;
    protected renderBody(container: HTMLElement): void;
    shouldShowWelcome(): boolean;
    focus(): void;
    private onFocusChanged;
    private hasOpenLinkModifier;
    private onSelectionChanged;
    private onContextMenu;
    private onMouseDblClick;
    private height;
    private width;
    protected layoutBody(height: number, width: number): void;
}
export declare class TunnelPanelDescriptor implements IViewDescriptor {
    readonly id = "~remote.forwardedPorts";
    readonly name: ILocalizedString;
    readonly ctorDescriptor: SyncDescriptor<TunnelPanel>;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly group = "details@0";
    readonly order = -500;
    readonly remoteAuthority?: string | string[];
    readonly canMoveView = true;
    readonly containerIcon: ThemeIcon;
    constructor(viewModel: ITunnelViewModel, environmentService: IWorkbenchEnvironmentService);
}
export declare namespace ForwardPortAction {
    const INLINE_ID = "remote.tunnel.forwardInline";
    const COMMANDPALETTE_ID = "remote.tunnel.forwardCommandPalette";
    const LABEL: ILocalizedString;
    const TREEITEM_LABEL: string;
    function inlineHandler(): ICommandHandler;
    function commandPaletteHandler(): ICommandHandler;
}
export declare namespace OpenPortInBrowserAction {
    const ID = "remote.tunnel.open";
    const LABEL: string;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, key: string): Promise<boolean> | Promise<void>;
}
export declare namespace OpenPortInPreviewAction {
    const ID = "remote.tunnel.openPreview";
    const LABEL: string;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, key: string): Promise<boolean | void>;
}
export {};
