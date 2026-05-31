
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IDownloadService } from '@codingame/monaco-vscode-api/vscode/vs/platform/download/common/download.service';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';

let MainThreadDownloadService = class MainThreadDownloadService extends Disposable {
    constructor(extHostContext, downloadService) {
        super();
        this.downloadService = downloadService;
    }
    $download(uri, to) {
        return this.downloadService.download(URI.revive(uri), URI.revive(to), "mainThreadDownloadService.download");
    }
};
MainThreadDownloadService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDownloadService),
    ( __param(1, IDownloadService))
], MainThreadDownloadService);

export { MainThreadDownloadService };
