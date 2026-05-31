
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IFileDialogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service';

var MainThreadDialogs_1;
let MainThreadDialogs = MainThreadDialogs_1 = class MainThreadDialogs {
    constructor(context, _fileDialogService) {
        this._fileDialogService = _fileDialogService;
    }
    dispose() {}
    async $showOpenDialog(options) {
        const convertedOptions = MainThreadDialogs_1._convertOpenOptions(options);
        if (!convertedOptions.defaultUri) {
            convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
        }
        return Promise.resolve(this._fileDialogService.showOpenDialog(convertedOptions));
    }
    async $showSaveDialog(options) {
        const convertedOptions = MainThreadDialogs_1._convertSaveOptions(options);
        if (!convertedOptions.defaultUri) {
            convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
        }
        return Promise.resolve(this._fileDialogService.showSaveDialog(convertedOptions));
    }
    static _convertOpenOptions(options) {
        const result = {
            openLabel: options?.openLabel || undefined,
            canSelectFiles: options?.canSelectFiles || (!options?.canSelectFiles && !options?.canSelectFolders),
            canSelectFolders: options?.canSelectFolders,
            canSelectMany: options?.canSelectMany,
            defaultUri: options?.defaultUri ? URI.revive(options.defaultUri) : undefined,
            title: options?.title || undefined,
            availableFileSystems: []
        };
        if (options?.filters) {
            result.filters = [];
            for (const [key, value] of Object.entries(options.filters)) {
                result.filters.push({
                    name: key,
                    extensions: value
                });
            }
        }
        return result;
    }
    static _convertSaveOptions(options) {
        const result = {
            defaultUri: options?.defaultUri ? URI.revive(options.defaultUri) : undefined,
            saveLabel: options?.saveLabel || undefined,
            title: options?.title || undefined
        };
        if (options?.filters) {
            result.filters = [];
            for (const [key, value] of Object.entries(options.filters)) {
                result.filters.push({
                    name: key,
                    extensions: value
                });
            }
        }
        return result;
    }
};
MainThreadDialogs = MainThreadDialogs_1 = __decorate([extHostNamedCustomer(MainContext.MainThreadDialogs), ( __param(1, IFileDialogService))], MainThreadDialogs);

export { MainThreadDialogs };
