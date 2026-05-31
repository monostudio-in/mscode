
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { dispose, DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { SearchProviderType, QueryType } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search';
import { ISearchService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { revive } from '@codingame/monaco-vscode-api/vscode/vs/base/common/marshalling';
import { SearchContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/search/common/constants';
import { IContextKeyService } from '@codingame/monaco-vscode-api/vscode/vs/platform/contextkey/common/contextkey.service';

let MainThreadSearch = class MainThreadSearch {
    constructor(
        extHostContext,
        _searchService,
        _telemetryService,
        _configurationService,
        contextKeyService
    ) {
        this._searchService = _searchService;
        this._telemetryService = _telemetryService;
        this.contextKeyService = contextKeyService;
        this._searchProvider = ( new Map());
        this._aiSearchProviderHandles = ( new Set());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostSearch));
        this._proxy.$enableExtensionHostSearch();
    }
    dispose() {
        this._searchProvider.forEach(value => value.dispose());
        this._searchProvider.clear();
        this._aiSearchProviderHandles.clear();
        SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(false);
    }
    $registerTextSearchProvider(handle, scheme) {
        this._searchProvider.set(handle, ( new RemoteSearchProvider(this._searchService, SearchProviderType.text, scheme, handle, this._proxy)));
    }
    $registerAITextSearchProvider(handle, scheme) {
        SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(true);
        this._aiSearchProviderHandles.add(handle);
        this._searchProvider.set(handle, ( new RemoteSearchProvider(
            this._searchService,
            SearchProviderType.aiText,
            scheme,
            handle,
            this._proxy
        )));
    }
    $registerFileSearchProvider(handle, scheme) {
        this._searchProvider.set(handle, ( new RemoteSearchProvider(this._searchService, SearchProviderType.file, scheme, handle, this._proxy)));
    }
    $unregisterProvider(handle) {
        dispose(this._searchProvider.get(handle));
        this._searchProvider.delete(handle);
        if (this._aiSearchProviderHandles.delete(handle) && this._aiSearchProviderHandles.size === 0) {
            SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(false);
        }
    }
    $handleFileMatch(handle, session, data) {
        const provider = this._searchProvider.get(handle);
        if (!provider) {
            throw ( new Error("Got result for unknown provider"));
        }
        provider.handleFindMatch(session, data);
    }
    $handleTextMatch(handle, session, data) {
        const provider = this._searchProvider.get(handle);
        if (!provider) {
            throw ( new Error("Got result for unknown provider"));
        }
        provider.handleFindMatch(session, data);
    }
    $handleKeywordResult(handle, session, data) {
        const provider = this._searchProvider.get(handle);
        if (!provider) {
            throw ( new Error("Got result for unknown provider"));
        }
        provider.handleKeywordResult(session, data);
    }
    $handleTelemetry(eventName, data) {
        this._telemetryService.publicLog(eventName, data);
    }
};
MainThreadSearch = __decorate([extHostNamedCustomer(MainContext.MainThreadSearch), ( __param(1, ISearchService)), ( __param(2, ITelemetryService)), ( __param(3, IConfigurationService)), ( __param(4, IContextKeyService))], MainThreadSearch);
class SearchOperation {
    static {
        this._idPool = 0;
    }
    constructor(
        progress,
        id = ++SearchOperation._idPool,
        matches = ( new Map()),
        keywords = []
    ) {
        this.progress = progress;
        this.id = id;
        this.matches = matches;
        this.keywords = keywords;
    }
    addMatch(match) {
        const existingMatch = this.matches.get(( match.resource.toString()));
        if (existingMatch) {
            if (existingMatch.results && match.results) {
                existingMatch.results.push(...match.results);
            }
        } else {
            this.matches.set(( match.resource.toString()), match);
        }
        this.progress?.(match);
    }
    addKeyword(result) {
        this.keywords.push(result);
        this.progress?.(result);
    }
}
class RemoteSearchProvider {
    constructor(searchService, type, _scheme, _handle, _proxy) {
        this._scheme = _scheme;
        this._handle = _handle;
        this._proxy = _proxy;
        this._registrations = ( new DisposableStore());
        this._searches = ( new Map());
        this._registrations.add(searchService.registerSearchResultProvider(this._scheme, type, this));
    }
    async getAIName() {
        if (this.cachedAIName === undefined) {
            this.cachedAIName = await this._proxy.$getAIName(this._handle);
        }
        return this.cachedAIName;
    }
    dispose() {
        this._registrations.dispose();
    }
    fileSearch(query, token = CancellationToken.None) {
        return this.doSearch(query, undefined, token);
    }
    textSearch(query, onProgress, token = CancellationToken.None) {
        return this.doSearch(query, onProgress, token);
    }
    doSearch(query, onProgress, token = CancellationToken.None) {
        if (!query.folderQueries.length) {
            throw ( new Error("Empty folderQueries"));
        }
        const search = ( new SearchOperation(onProgress));
        this._searches.set(search.id, search);
        const searchP = this._provideSearchResults(query, search.id, token);
        return Promise.resolve(searchP).then(result => {
            this._searches.delete(search.id);
            return {
                results: Array.from(( search.matches.values())),
                aiKeywords: Array.from(search.keywords),
                stats: result.stats,
                limitHit: result.limitHit,
                messages: result.messages
            };
        }, err => {
            this._searches.delete(search.id);
            return Promise.reject(err);
        });
    }
    clearCache(cacheKey) {
        return Promise.resolve(this._proxy.$clearCache(cacheKey));
    }
    handleFindMatch(session, dataOrUri) {
        const searchOp = this._searches.get(session);
        if (!searchOp) {
            return;
        }
        dataOrUri.forEach(result => {
            if (result.results) {
                searchOp.addMatch(revive(result));
            } else {
                searchOp.addMatch({
                    resource: URI.revive(result)
                });
            }
        });
    }
    handleKeywordResult(session, data) {
        const searchOp = this._searches.get(session);
        if (!searchOp) {
            return;
        }
        searchOp.addKeyword(data);
    }
    _provideSearchResults(query, session, token) {
        switch (query.type) {
        case QueryType.File:
            return this._proxy.$provideFileSearchResults(this._handle, session, query, token);
        case QueryType.Text:
            return this._proxy.$provideTextSearchResults(this._handle, session, query, token);
        default:
            return this._proxy.$provideAITextSearchResults(this._handle, session, query, token);
        }
    }
}

export { MainThreadSearch };
