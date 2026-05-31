
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ITimelineService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/timeline/common/timeline.service';
import { revive } from '@codingame/monaco-vscode-api/vscode/vs/base/common/marshalling';

let MainThreadTimeline = class MainThreadTimeline {
    constructor(context, logService, _timelineService) {
        this.logService = logService;
        this._timelineService = _timelineService;
        this._providerEmitters = ( new Map());
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostTimeline));
    }
    $registerTimelineProvider(provider) {
        this.logService.trace(`MainThreadTimeline#registerTimelineProvider: id=${provider.id}`);
        const proxy = this._proxy;
        const emitters = this._providerEmitters;
        let onDidChange = emitters.get(provider.id);
        if (onDidChange === undefined) {
            onDidChange = ( new Emitter());
            emitters.set(provider.id, onDidChange);
        }
        this._timelineService.registerTimelineProvider({
            ...provider,
            onDidChange: onDidChange.event,
            async provideTimeline(uri, options, token) {
                return revive(await proxy.$getTimeline(provider.id, uri, options, token));
            },
            dispose() {
                emitters.delete(provider.id);
                onDidChange?.dispose();
            }
        });
    }
    $unregisterTimelineProvider(id) {
        this.logService.trace(`MainThreadTimeline#unregisterTimelineProvider: id=${id}`);
        this._timelineService.unregisterTimelineProvider(id);
    }
    $emitTimelineChangeEvent(e) {
        this.logService.trace(
            `MainThreadTimeline#emitChangeEvent: id=${e.id}, uri=${e.uri?.toString(true)}`
        );
        const emitter = this._providerEmitters.get(e.id);
        emitter?.fire(e);
    }
    dispose() {}
};
MainThreadTimeline = __decorate([extHostNamedCustomer(MainContext.MainThreadTimeline), ( __param(1, ILogService)), ( __param(2, ITimelineService))], MainThreadTimeline);

export { MainThreadTimeline };
