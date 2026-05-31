
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { strictEquals } from '../../../base/common/equals.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import '../../../base/common/observableInternal/index.js';
import { DebugNameData } from '../../../base/common/observableInternal/debugName.js';
import { ObservableValue } from '../../../base/common/observableInternal/observables/observableValue.js';
import { IStorageService } from '../../storage/common/storage.service.js';
import { DebugLocation } from '../../../base/common/observableInternal/debugLocation.js';

function observableMemento(opts) {
    return (scope, target, storageService) => {
        return ( new ObservableMemento(opts, scope, target, storageService));
    };
}
let ObservableMemento = class ObservableMemento extends ObservableValue {
    constructor(opts, storageScope, storageTarget, storageService) {
        const getStorageValue = () => {
            const fromStorage = storageService.get(opts.key, storageScope);
            if (fromStorage !== undefined) {
                try {
                    return opts.fromStorage(fromStorage);
                } catch {
                    return opts.defaultValue;
                }
            }
            return opts.defaultValue;
        };
        const initialValue = getStorageValue();
        super(( new DebugNameData(undefined, `storage/${opts.key}`, undefined)), initialValue, strictEquals, DebugLocation.ofCaller());
        this.opts = opts;
        this.storageScope = storageScope;
        this.storageTarget = storageTarget;
        this.storageService = storageService;
        this._store = ( new DisposableStore());
        this._noStorageUpdateNeeded = false;
        const didChange = storageService.onDidChangeValue(storageScope, opts.key, this._store);
        this._store.add(didChange(e => {
            if (e.external && e.key === opts.key) {
                this._noStorageUpdateNeeded = true;
                try {
                    this.set(getStorageValue(), undefined);
                } finally {
                    this._noStorageUpdateNeeded = false;
                }
            }
        }));
    }
    _setValue(newValue) {
        super._setValue(newValue);
        if (this._noStorageUpdateNeeded) {
            return;
        }
        const valueToStore = this.opts.toStorage(this.get());
        this.storageService.store(this.opts.key, valueToStore, this.storageScope, this.storageTarget);
    }
    dispose() {
        this._store.dispose();
    }
};
ObservableMemento = ( __decorate([( __param(3, IStorageService))], ObservableMemento));

export { ObservableMemento, observableMemento };
