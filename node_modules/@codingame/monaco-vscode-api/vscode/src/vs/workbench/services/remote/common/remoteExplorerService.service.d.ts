import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { TunnelInformation } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { RemoteTunnel } from "../../../../platform/tunnel/common/tunnel.js";
import { IEditableData } from "../../../common/views.js";
import { IExtensionPointUser } from "../../extensions/common/extensionsRegistry.js";
import { HelpInformation, ITunnelItem, TunnelEditId, PortsEnablement } from "./remoteExplorerService.js";
import { TunnelModel, TunnelProperties, Attributes, TunnelCloseReason, CandidatePort } from "./tunnelModel.js";
export declare const IRemoteExplorerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteExplorerService>;
export interface IRemoteExplorerService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTargetType: Event<string[]>;
    targetType: string[];
    readonly onDidChangeHelpInformation: Event<readonly IExtensionPointUser<HelpInformation>[]>;
    helpInformation: IExtensionPointUser<HelpInformation>[];
    readonly tunnelModel: TunnelModel;
    readonly onDidChangeEditable: Event<{
        tunnel: ITunnelItem;
        editId: TunnelEditId;
    } | undefined>;
    setEditable(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId, data: IEditableData | null): void;
    getEditableData(tunnelItem: ITunnelItem | undefined, editId?: TunnelEditId): IEditableData | undefined;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | string | undefined>;
    close(remote: {
        host: string;
        port: number;
    }, reason: TunnelCloseReason): Promise<void>;
    setTunnelInformation(tunnelInformation: TunnelInformation | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): IDisposable;
    onFoundNewCandidates(candidates: CandidatePort[]): void;
    restore(): Promise<void>;
    enablePortsFeatures(viewOnly: boolean): void;
    readonly onEnabledPortsFeatures: Event<void>;
    portsFeaturesEnabled: PortsEnablement;
    readonly namedProcesses: Map<number, string>;
}
