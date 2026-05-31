
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../base/common/event.js';
import { StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';

var ReplaceWidgetHistory_1;
let ReplaceWidgetHistory = class ReplaceWidgetHistory {
    static {
        ReplaceWidgetHistory_1 = this;
    }
    static {
        this.FIND_HISTORY_KEY = "workbench.replace.history";
    }
    static {
        this._instance = null;
    }
    static getOrCreate(storageService) {
        if (!ReplaceWidgetHistory_1._instance) {
            ReplaceWidgetHistory_1._instance = ( new ReplaceWidgetHistory_1(storageService));
        }
        return ReplaceWidgetHistory_1._instance;
    }
    constructor(storageService) {
        this.storageService = storageService;
        this.inMemoryValues = ( new Set());
        this._onDidChangeEmitter = ( new Emitter());
        this.onDidChange = this._onDidChangeEmitter.event;
        this.load();
    }
    delete(t) {
        const result = this.inMemoryValues.delete(t);
        this.save();
        return result;
    }
    add(t) {
        this.inMemoryValues.add(t);
        this.save();
        return this;
    }
    has(t) {
        return ( this.inMemoryValues.has(t));
    }
    clear() {
        this.inMemoryValues.clear();
        this.save();
    }
    forEach(callbackfn, thisArg) {
        this.load();
        return this.inMemoryValues.forEach(callbackfn);
    }
    replace(t) {
        this.inMemoryValues = ( new Set(t));
        this.save();
    }
    load() {
        let result;
        const raw = this.storageService.get(ReplaceWidgetHistory_1.FIND_HISTORY_KEY, StorageScope.WORKSPACE);
        if (raw) {
            try {
                result = JSON.parse(raw);
            } catch (e) {}
        }
        this.inMemoryValues = ( new Set(result || []));
    }
    save() {
        const elements = [];
        this.inMemoryValues.forEach(e => elements.push(e));
        return ( new Promise(resolve => {
            this.storageService.store(
                ReplaceWidgetHistory_1.FIND_HISTORY_KEY,
                JSON.stringify(elements),
                StorageScope.WORKSPACE,
                StorageTarget.USER
            );
            this._onDidChangeEmitter.fire(elements);
            resolve();
        }));
    }
};
ReplaceWidgetHistory = ReplaceWidgetHistory_1 = ( __decorate([( __param(0, IStorageService))], ReplaceWidgetHistory));

export { ReplaceWidgetHistory };
