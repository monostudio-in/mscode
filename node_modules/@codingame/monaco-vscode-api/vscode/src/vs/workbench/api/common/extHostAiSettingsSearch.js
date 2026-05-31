
import { MainContext } from './extHost.protocol.js';
import { Disposable } from './extHostTypes.js';
import { Progress } from '../../../platform/progress/common/progress.js';
import { AiSettingsSearch } from './extHostTypeConverters.js';

class ExtHostAiSettingsSearch {
    constructor(mainContext) {
        this._settingsSearchProviders = ( new Map());
        this._nextHandle = 0;
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadAiSettingsSearch));
    }
    async $startSearch(handle, query, option, token) {
        if (this._settingsSearchProviders.size === 0) {
            throw ( new Error("No related information providers registered"));
        }
        const provider = this._settingsSearchProviders.get(handle);
        if (!provider) {
            throw ( new Error("Settings search provider not found"));
        }
        const progressReporter = ( new Progress(data => {
            this._proxy.$handleSearchResult(handle, AiSettingsSearch.fromSettingsSearchResult(data));
        }));
        return provider.provideSettingsSearchResults(query, option, progressReporter, token);
    }
    registerSettingsSearchProvider(extension, provider) {
        const handle = this._nextHandle;
        this._nextHandle++;
        this._settingsSearchProviders.set(handle, provider);
        this._proxy.$registerAiSettingsSearchProvider(handle);
        return ( new Disposable(() => {
            this._proxy.$unregisterAiSettingsSearchProvider(handle);
            this._settingsSearchProviders.delete(handle);
        }));
    }
}

export { ExtHostAiSettingsSearch };
