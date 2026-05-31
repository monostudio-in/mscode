
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ILabelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadLabelService = class MainThreadLabelService extends Disposable {
    constructor(_, _labelService) {
        super();
        this._labelService = _labelService;
        this._resourceLabelFormatters = this._register(( new DisposableMap()));
    }
    $registerResourceLabelFormatter(handle, formatter) {
        formatter.priority = true;
        const disposable = this._labelService.registerCachedFormatter(formatter);
        this._resourceLabelFormatters.set(handle, disposable);
    }
    $unregisterResourceLabelFormatter(handle) {
        this._resourceLabelFormatters.deleteAndDispose(handle);
    }
};
MainThreadLabelService = __decorate([extHostNamedCustomer(MainContext.MainThreadLabelService), ( __param(1, ILabelService))], MainThreadLabelService);

export { MainThreadLabelService };
