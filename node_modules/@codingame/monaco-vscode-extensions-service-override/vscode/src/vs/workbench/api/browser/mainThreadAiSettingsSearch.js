
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IAiSettingsSearchService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiSettingsSearch/common/aiSettingsSearch.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadAiSettingsSearch = class MainThreadAiSettingsSearch extends Disposable {
    constructor(context, _settingsSearchService) {
        super();
        this._settingsSearchService = _settingsSearchService;
        this._registrations = this._register(( new DisposableMap()));
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostAiSettingsSearch));
    }
    $registerAiSettingsSearchProvider(handle) {
        const provider = {
            searchSettings: (query, option, token) => {
                return this._proxy.$startSearch(handle, query, option, token);
            }
        };
        this._registrations.set(
            handle,
            this._settingsSearchService.registerSettingsSearchProvider(provider)
        );
    }
    $unregisterAiSettingsSearchProvider(handle) {
        this._registrations.deleteAndDispose(handle);
    }
    $handleSearchResult(handle, result) {
        if (!( this._registrations.has(handle))) {
            throw ( new Error(`No AI settings search provider found`));
        }
        this._settingsSearchService.handleSearchResult(result);
    }
};
MainThreadAiSettingsSearch = __decorate([
    extHostNamedCustomer(MainContext.MainThreadAiSettingsSearch),
    ( __param(1, IAiSettingsSearchService))
], MainThreadAiSettingsSearch);

export { MainThreadAiSettingsSearch };
