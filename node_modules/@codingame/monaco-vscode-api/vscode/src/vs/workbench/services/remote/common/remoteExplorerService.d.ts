import { Event } from "../../../../base/common/event.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { RemoteTunnel, TunnelProtocol } from "../../../../platform/tunnel/common/tunnel.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.service.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IEditableData } from "../../../common/views.js";
import { TunnelInformation, TunnelPrivacy } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { URI } from "../../../../base/common/uri.js";
import { Attributes, CandidatePort, TunnelCloseReason, TunnelModel, TunnelProperties, TunnelSource } from "./tunnelModel.js";
import { IExtensionPointUser } from "../../extensions/common/extensionsRegistry.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IRemoteExplorerService } from "./remoteExplorerService.service.js";
export declare const REMOTE_EXPLORER_TYPE_KEY: string;
export declare const TUNNEL_VIEW_ID = "~remote.forwardedPorts";
export declare const TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";
export declare const PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";
export declare const PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";
export declare const PORT_AUTO_FALLBACK_SETTING = "remote.autoForwardPortsFallback";
export declare const PORT_AUTO_SOURCE_SETTING_PROCESS = "process";
export declare const PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";
export declare const PORT_AUTO_SOURCE_SETTING_HYBRID = "hybrid";
export declare enum TunnelType {
    Candidate = "Candidate",
    Detected = "Detected",
    Forwarded = "Forwarded",
    Add = "Add"
}
export interface ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    localAddress?: string;
    protocol: TunnelProtocol;
    localUri?: URI;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    source: {
        source: TunnelSource;
        description: string;
    };
    privacy: TunnelPrivacy;
    processDescription?: string;
    readonly label: string;
}
export declare enum TunnelEditId {
    None = 0,
    New = 1,
    Label = 2,
    LocalPort = 3
}
export interface HelpInformation {
    extensionDescription: IExtensionDescription;
    getStarted?: string | {
        id: string;
    };
    documentation?: string;
    issues?: string;
    reportIssue?: string;
    remoteName?: string[] | string;
    virtualWorkspace?: string;
}
export declare enum PortsEnablement {
    Disabled = 0,
    ViewOnly = 1,
    AdditionalFeatures = 2
}
export declare class RemoteExplorerService implements IRemoteExplorerService {
    private readonly storageService;
    private readonly tunnelService;
    _serviceBrand: undefined;
    private _targetType;
    private readonly _onDidChangeTargetType;
    readonly onDidChangeTargetType: Event<string[]>;
    private readonly _onDidChangeHelpInformation;
    readonly onDidChangeHelpInformation: Event<readonly IExtensionPointUser<HelpInformation>[]>;
    private _helpInformation;
    private _tunnelModel;
    private _editable;
    private readonly _onDidChangeEditable;
    readonly onDidChangeEditable: Event<{
        tunnel: ITunnelItem;
        editId: TunnelEditId;
    } | undefined>;
    private readonly _onEnabledPortsFeatures;
    readonly onEnabledPortsFeatures: Event<void>;
    private _portsFeaturesEnabled;
    readonly namedProcesses: Map<number, string>;
    constructor(storageService: IStorageService, tunnelService: ITunnelService, instantiationService: IInstantiationService);
    get helpInformation(): IExtensionPointUser<HelpInformation>[];
    set targetType(name: string[]);
    get targetType(): string[];
    get tunnelModel(): TunnelModel;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | string | undefined>;
    close(remote: {
        host: string;
        port: number;
    }, reason: TunnelCloseReason): Promise<void>;
    setTunnelInformation(tunnelInformation: TunnelInformation | undefined): void;
    setEditable(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId, data: IEditableData | null): void;
    getEditableData(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId): IEditableData | undefined;
    setCandidateFilter(filter: (candidates: CandidatePort[]) => Promise<CandidatePort[]>): IDisposable;
    onFoundNewCandidates(candidates: CandidatePort[]): void;
    restore(): Promise<void>;
    enablePortsFeatures(viewOnly: boolean): void;
    get portsFeaturesEnabled(): PortsEnablement;
}
