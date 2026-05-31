
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { IMarkerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/markers/common/markers.service';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { ResourceMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/map';

var MainThreadDiagnostics_1;
let MainThreadDiagnostics = class MainThreadDiagnostics {
    static {
        MainThreadDiagnostics_1 = this;
    }
    static {
        this.ExtHostCounter = 1;
    }
    constructor(extHostContext, _markerService, _uriIdentService) {
        this._markerService = _markerService;
        this._uriIdentService = _uriIdentService;
        this._activeOwners = ( new Set());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostDiagnostics));
        this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
        this.extHostId = `extHost${MainThreadDiagnostics_1.ExtHostCounter++}`;
    }
    dispose() {
        this._markerListener.dispose();
        for (const owner of this._activeOwners) {
            const markersData = ( new ResourceMap());
            for (const marker of this._markerService.read({
                owner
            })) {
                let data = markersData.get(marker.resource);
                if (data === undefined) {
                    data = [];
                    markersData.set(marker.resource, data);
                }
                if (marker.origin !== this.extHostId) {
                    data.push(marker);
                }
            }
            for (const [resource, local] of markersData.entries()) {
                this._markerService.changeOne(owner, resource, local);
            }
        }
        this._activeOwners.clear();
    }
    _forwardMarkers(resources) {
        const data = [];
        for (const resource of resources) {
            const allMarkerData = this._markerService.read({
                resource,
                ignoreResourceFilters: true
            });
            if (allMarkerData.length === 0) {
                data.push([resource, []]);
            } else {
                const foreignMarkerData = allMarkerData.filter(marker => marker?.origin !== this.extHostId);
                if (foreignMarkerData.length > 0) {
                    data.push([resource, foreignMarkerData]);
                }
            }
        }
        if (data.length > 0) {
            this._proxy.$acceptMarkersChange(data);
        }
    }
    $changeMany(owner, entries) {
        for (const entry of entries) {
            const [uri, markers] = entry;
            if (markers) {
                for (const marker of markers) {
                    if (marker.relatedInformation) {
                        for (const relatedInformation of marker.relatedInformation) {
                            relatedInformation.resource = URI.revive(relatedInformation.resource);
                        }
                    }
                    if (marker.code && typeof marker.code !== "string") {
                        marker.code.target = URI.revive(marker.code.target);
                    }
                    if (marker.origin === undefined) {
                        marker.origin = this.extHostId;
                    }
                }
            }
            this._markerService.changeOne(owner, this._uriIdentService.asCanonicalUri(URI.revive(uri)), markers);
        }
        this._activeOwners.add(owner);
    }
    $clear(owner) {
        this._markerService.changeAll(owner, []);
        this._activeOwners.delete(owner);
    }
};
MainThreadDiagnostics = MainThreadDiagnostics_1 = __decorate([extHostNamedCustomer(MainContext.MainThreadDiagnostics), ( __param(1, IMarkerService)), ( __param(2, IUriIdentityService))], MainThreadDiagnostics);

export { MainThreadDiagnostics };
