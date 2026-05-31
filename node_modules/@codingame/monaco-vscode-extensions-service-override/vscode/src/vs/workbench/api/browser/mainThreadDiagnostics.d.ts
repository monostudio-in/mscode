import { IMarkerData } from "@codingame/monaco-vscode-api/vscode/vs/platform/markers/common/markers";
import { IMarkerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/markers/common/markers.service";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { MainThreadDiagnosticsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
export declare class MainThreadDiagnostics implements MainThreadDiagnosticsShape {
    private readonly _markerService;
    private readonly _uriIdentService;
    private readonly _activeOwners;
    private readonly _proxy;
    private readonly _markerListener;
    private static ExtHostCounter;
    private readonly extHostId;
    constructor(extHostContext: IExtHostContext, _markerService: IMarkerService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    private _forwardMarkers;
    $changeMany(owner: string, entries: [
        UriComponents,
        IMarkerData[]
    ][]): void;
    $clear(owner: string): void;
}
