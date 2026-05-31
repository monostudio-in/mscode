
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Event } from '../../../../base/common/event.js';
import { LRUCache } from '../../../../base/common/map.js';
import { Range } from '../../../common/core/range.js';
import { CodeLensModel } from './codelens.js';
import '../../../../platform/instantiation/common/extensions.js';
import { StorageScope, WillSaveStateReason, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { runWhenWindowIdle } from '../../../../base/browser/dom.js';
import '../../../../platform/instantiation/common/instantiation.js';

class CacheItem {
    constructor(lineCount, data) {
        this.lineCount = lineCount;
        this.data = data;
    }
}
let CodeLensCache = class CodeLensCache {
    constructor(storageService) {
        this._fakeProvider = new class {
            provideCodeLenses() {
                throw ( new Error("not supported"));
            }
        }();
        this._cache = ( new LRUCache(20, 0.75));
        const oldkey = "codelens/cache";
        runWhenWindowIdle(mainWindow, () => storageService.remove(oldkey, StorageScope.WORKSPACE));
        const key = "codelens/cache2";
        const raw = storageService.get(key, StorageScope.WORKSPACE, "{}");
        this._deserialize(raw);
        const onWillSaveStateBecauseOfShutdown = Event.filter(
            storageService.onWillSaveState,
            e => e.reason === WillSaveStateReason.SHUTDOWN
        );
        Event.once(onWillSaveStateBecauseOfShutdown)(e => {
            storageService.store(key, this._serialize(), StorageScope.WORKSPACE, StorageTarget.MACHINE);
        });
    }
    put(model, data) {
        const copyItems = ( data.lenses.map(item => {
            return {
                range: item.symbol.range,
                command: item.symbol.command && {
                    id: "",
                    title: item.symbol.command?.title
                }
            };
        }));
        const copyModel = ( new CodeLensModel());
        copyModel.add({
            lenses: copyItems
        }, this._fakeProvider);
        const item = ( new CacheItem(model.getLineCount(), copyModel));
        this._cache.set(( model.uri.toString()), item);
    }
    get(model) {
        const item = this._cache.get(( model.uri.toString()));
        return item && item.lineCount === model.getLineCount() ? item.data : undefined;
    }
    delete(model) {
        this._cache.delete(( model.uri.toString()));
    }
    _serialize() {
        const data = Object.create(null);
        for (const [key, value] of this._cache) {
            const lines = ( new Set());
            for (const d of value.data.lenses) {
                lines.add(d.symbol.range.startLineNumber);
            }
            data[key] = {
                lineCount: value.lineCount,
                lines: [...( lines.values())]
            };
        }
        return JSON.stringify(data);
    }
    _deserialize(raw) {
        try {
            const data = JSON.parse(raw);
            for (const key in data) {
                const element = data[key];
                const lenses = [];
                for (const line of element.lines) {
                    lenses.push({
                        range: ( new Range(line, 1, line, 11))
                    });
                }
                const model = ( new CodeLensModel());
                model.add({
                    lenses
                }, this._fakeProvider);
                this._cache.set(key, ( new CacheItem(element.lineCount, model)));
            }
        } catch {}
    }
};
CodeLensCache = ( __decorate([( __param(0, IStorageService))], CodeLensCache));

export { CodeLensCache };
