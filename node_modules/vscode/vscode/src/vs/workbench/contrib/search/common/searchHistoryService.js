
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../base/common/event.js';
import { StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { isEmptyObject } from '../../../../base/common/types.js';

var SearchHistoryService_1;
let SearchHistoryService = class SearchHistoryService {
    static {
        SearchHistoryService_1 = this;
    }
    static {
        this.SEARCH_HISTORY_KEY = "workbench.search.history";
    }
    constructor(storageService) {
        this.storageService = storageService;
        this._onDidClearHistory = ( new Emitter());
        this.onDidClearHistory = this._onDidClearHistory.event;
    }
    clearHistory() {
        this.storageService.remove(SearchHistoryService_1.SEARCH_HISTORY_KEY, StorageScope.WORKSPACE);
        this._onDidClearHistory.fire();
    }
    load() {
        let result;
        const raw = this.storageService.get(SearchHistoryService_1.SEARCH_HISTORY_KEY, StorageScope.WORKSPACE);
        if (raw) {
            try {
                result = JSON.parse(raw);
            } catch (e) {}
        }
        return result || {};
    }
    save(history) {
        if (isEmptyObject(history)) {
            this.storageService.remove(SearchHistoryService_1.SEARCH_HISTORY_KEY, StorageScope.WORKSPACE);
        } else {
            this.storageService.store(
                SearchHistoryService_1.SEARCH_HISTORY_KEY,
                JSON.stringify(history),
                StorageScope.WORKSPACE,
                StorageTarget.USER
            );
        }
    }
};
SearchHistoryService = SearchHistoryService_1 = ( __decorate([( __param(0, IStorageService))], SearchHistoryService));

export { SearchHistoryService };
