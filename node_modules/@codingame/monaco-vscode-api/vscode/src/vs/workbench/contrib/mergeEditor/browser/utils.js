
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { ArrayQueue, CompareResult } from '../../../../base/common/arrays.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import '../../../../base/common/observableInternal/index.js';
import { StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { autorunOpts } from '../../../../base/common/observableInternal/reactions/autorun.js';

function setStyle(element, style) {
    Object.entries(style).forEach(([key, value]) => {
        element.style.setProperty(key, toSize(value));
    });
}
function toSize(value) {
    return typeof value === "number" ? `${value}px` : value;
}
function applyObservableDecorations(editor, decorations) {
    const d = ( new DisposableStore());
    let decorationIds = [];
    d.add(autorunOpts({
        debugName: () => `Apply decorations from ${decorations.debugName}`
    }, reader => {
        const d = decorations.read(reader);
        editor.changeDecorations(a => {
            decorationIds = a.deltaDecorations(decorationIds, d);
        });
    }));
    d.add({
        dispose: () => {
            editor.changeDecorations(a => {
                decorationIds = a.deltaDecorations(decorationIds, []);
            });
        }
    });
    return d;
}
function* leftJoin(left, right, compare) {
    const rightQueue = ( new ArrayQueue(right));
    for (const leftElement of left) {
        rightQueue.takeWhile(
            rightElement => CompareResult.isGreaterThan(compare(leftElement, rightElement))
        );
        const equals = rightQueue.takeWhile(
            rightElement => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement))
        );
        yield {
            left: leftElement,
            rights: equals || []
        };
    }
}
function* join(left, right, compare) {
    const rightQueue = ( new ArrayQueue(right));
    for (const leftElement of left) {
        const skipped = rightQueue.takeWhile(
            rightElement => CompareResult.isGreaterThan(compare(leftElement, rightElement))
        );
        if (skipped) {
            yield {
                rights: skipped
            };
        }
        const equals = rightQueue.takeWhile(
            rightElement => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement))
        );
        yield {
            left: leftElement,
            rights: equals || []
        };
    }
}
function setFields(obj, fields) {
    return Object.assign(obj, fields);
}
function deepMerge(source1, source2) {
    const result = {};
    for (const key in source1) {
        result[key] = source1[key];
    }
    for (const key in source2) {
        const source2Value = source2[key];
        if (typeof result[key] === "object" && source2Value && typeof source2Value === "object") {
            result[key] = deepMerge(result[key], source2Value);
        } else {
            result[key] = source2Value;
        }
    }
    return result;
}
let PersistentStore = class PersistentStore {
    constructor(key, storageService) {
        this.key = key;
        this.storageService = storageService;
        this.hasValue = false;
        this.value = undefined;
    }
    get() {
        if (!this.hasValue) {
            const value = this.storageService.get(this.key, StorageScope.PROFILE);
            if (value !== undefined) {
                try {
                    this.value = JSON.parse(value);
                } catch (e) {
                    onUnexpectedError(e);
                }
            }
            this.hasValue = true;
        }
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
        this.storageService.store(
            this.key,
            JSON.stringify(this.value),
            StorageScope.PROFILE,
            StorageTarget.USER
        );
    }
};
PersistentStore = ( __decorate([( __param(1, IStorageService))], PersistentStore));

export { PersistentStore, applyObservableDecorations, deepMerge, join, leftJoin, setFields, setStyle };
