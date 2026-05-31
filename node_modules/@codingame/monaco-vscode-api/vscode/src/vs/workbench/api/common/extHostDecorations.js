
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { Disposable, FileDecoration } from './extHostTypes.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { asArray, groupBy } from '../../../base/common/arrays.js';
import { count, compare } from '../../../base/common/strings.js';
import { dirname } from '../../../base/common/path.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';

var ExtHostDecorations_1;
let ExtHostDecorations = class ExtHostDecorations {
    static {
        ExtHostDecorations_1 = this;
    }
    static {
        this._handlePool = 0;
    }
    static {
        this._maxEventSize = 250;
    }
    constructor(extHostRpc, _logService) {
        this._logService = _logService;
        this._provider = ( new Map());
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadDecorations));
    }
    registerFileDecorationProvider(provider, extensionDescription) {
        const handle = ExtHostDecorations_1._handlePool++;
        this._provider.set(handle, {
            provider,
            extensionDescription
        });
        this._proxy.$registerDecorationProvider(handle, extensionDescription.identifier.value);
        const listener = provider.onDidChangeFileDecorations && provider.onDidChangeFileDecorations(e => {
            if (!e) {
                this._proxy.$onDidChange(handle, null);
                return;
            }
            const array = asArray(e);
            if (array.length <= ExtHostDecorations_1._maxEventSize) {
                this._proxy.$onDidChange(handle, array);
                return;
            }
            this._logService.warn(
                "[Decorations] CAPPING events from decorations provider",
                extensionDescription.identifier.value,
                array.length
            );
            const mapped = ( array.map(uri => ({
                uri,
                rank: count(uri.path, "/")
            })));
            const groups = groupBy(mapped, (a, b) => a.rank - b.rank || compare(a.uri.path, b.uri.path));
            const picked = [];
            outer:
            for (const uris of groups) {
                let lastDirname;
                for (const obj of uris) {
                    const myDirname = dirname(obj.uri.path);
                    if (lastDirname !== myDirname) {
                        lastDirname = myDirname;
                        if (picked.push(obj.uri) >= ExtHostDecorations_1._maxEventSize) {
                            break outer;
                        }
                    }
                }
            }
            this._proxy.$onDidChange(handle, picked);
        });
        return ( new Disposable(() => {
            listener?.dispose();
            this._proxy.$unregisterDecorationProvider(handle);
            this._provider.delete(handle);
        }));
    }
    async $provideDecorations(handle, requests, token) {
        if (!( this._provider.has(handle))) {
            return Object.create(null);
        }
        const result = Object.create(null);
        const {
            provider,
            extensionDescription: extensionId
        } = this._provider.get(handle);
        await Promise.all(( requests.map(async request => {
            try {
                const {
                    uri,
                    id
                } = request;
                const data = await Promise.resolve(provider.provideFileDecoration(URI.revive(uri), token));
                if (!data) {
                    return;
                }
                try {
                    FileDecoration.validate(data);
                    if (data.badge && typeof data.badge !== "string") {
                        checkProposedApiEnabled(extensionId, "codiconDecoration");
                    }
                    result[id] = [data.propagate, data.tooltip, data.badge, data.color];
                } catch (e) {
                    this._logService.warn(
                        `INVALID decoration from extension '${extensionId.identifier.value}': ${e}`
                    );
                }
            } catch (err) {
                this._logService.error(err);
            }
        })));
        return result;
    }
};
ExtHostDecorations = ExtHostDecorations_1 = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, ILogService))], ExtHostDecorations));
const IExtHostDecorations = ( createDecorator("IExtHostDecorations"));

export { ExtHostDecorations, IExtHostDecorations };
