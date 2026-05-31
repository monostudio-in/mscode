
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IClipboardService } from '@codingame/monaco-vscode-api/vscode/vs/platform/clipboard/common/clipboardService.service';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';

let MainThreadClipboard = class MainThreadClipboard {
    constructor(_context, _clipboardService, _logService) {
        this._clipboardService = _clipboardService;
        this._logService = _logService;
    }
    dispose() {}
    $readText() {
        this._logService.trace("MainThreadClipboard#readText");
        const readText = this._clipboardService.readText();
        return readText;
    }
    $writeText(value) {
        this._logService.trace("MainThreadClipboard#writeText with text.length : ", value.length);
        return this._clipboardService.writeText(value);
    }
};
MainThreadClipboard = __decorate([extHostNamedCustomer(MainContext.MainThreadClipboard), ( __param(1, IClipboardService)), ( __param(2, ILogService))], MainThreadClipboard);

export { MainThreadClipboard };
