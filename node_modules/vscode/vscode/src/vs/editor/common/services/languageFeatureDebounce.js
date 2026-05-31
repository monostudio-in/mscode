
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { doHash } from '../../../base/common/hash.js';
import { LRUCache } from '../../../base/common/map.js';
import { clamp, SlidingWindowAverage, MovingAverage } from '../../../base/common/numbers.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.service.js';
import '../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { matchesScheme } from '../../../base/common/network.js';
import '../../../platform/instantiation/common/instantiation.js';

var IdentityHash;
(function(IdentityHash) {
    const _hashes = ( new WeakMap());
    let pool = 0;
    function of(obj) {
        let value = _hashes.get(obj);
        if (value === undefined) {
            value = ++pool;
            _hashes.set(obj, value);
        }
        return value;
    }
    IdentityHash.of = of;
})(IdentityHash || (IdentityHash = {}));
class NullDebounceInformation {
    constructor(_default) {
        this._default = _default;
    }
    get(_model) {
        return this._default;
    }
    update(_model, _value) {
        return this._default;
    }
    default() {
        return this._default;
    }
}
class FeatureDebounceInformation {
    constructor(_logService, _name, _registry, _default, _min, _max) {
        this._logService = _logService;
        this._name = _name;
        this._registry = _registry;
        this._default = _default;
        this._min = _min;
        this._max = _max;
        this._cache = ( new LRUCache(50, 0.7));
    }
    _key(model) {
        return model.id + this._registry.all(model).reduce((hashVal, obj) => doHash(IdentityHash.of(obj), hashVal), 0);
    }
    get(model) {
        const key = this._key(model);
        const avg = this._cache.get(key);
        return avg ? clamp(avg.value, this._min, this._max) : this.default();
    }
    update(model, value) {
        const key = this._key(model);
        let avg = this._cache.get(key);
        if (!avg) {
            avg = ( new SlidingWindowAverage(6));
            this._cache.set(key, avg);
        }
        const newValue = clamp(avg.update(value), this._min, this._max);
        if (!matchesScheme(model.uri, "output")) {
            this._logService.trace(`[DEBOUNCE: ${this._name}] for ${( model.uri.toString())} is ${newValue}ms`);
        }
        return newValue;
    }
    _overall() {
        const result = ( new MovingAverage());
        for (const [, avg] of this._cache) {
            result.update(avg.value);
        }
        return result.value;
    }
    default() {
        const value = (this._overall() | 0) || this._default;
        return clamp(value, this._min, this._max);
    }
}
let LanguageFeatureDebounceService = class LanguageFeatureDebounceService {
    constructor(_logService, envService) {
        this._logService = _logService;
        this._data = ( new Map());
        this._isDev = envService.isExtensionDevelopment || !envService.isBuilt;
    }
    for(feature, name, config) {
        const min = config?.min ?? 50;
        const max = config?.max ?? min ** 2;
        const extra = config?.key ?? undefined;
        const key = `${IdentityHash.of(feature)},${min}${extra ? "," + extra : ""}`;
        let info = this._data.get(key);
        if (!info) {
            if (this._isDev) {
                this._logService.debug(`[DEBOUNCE: ${name}] is disabled in developed mode`);
                info = ( new NullDebounceInformation(min * 1.5));
            } else {
                info = ( new FeatureDebounceInformation(
                    this._logService,
                    name,
                    feature,
                    (this._overallAverage() | 0) || (min * 1.5),
                    min,
                    max
                ));
            }
            this._data.set(key, info);
        }
        return info;
    }
    _overallAverage() {
        const result = ( new MovingAverage());
        for (const info of ( this._data.values())) {
            result.update(info.default());
        }
        return result.value;
    }
};
LanguageFeatureDebounceService = ( __decorate([( __param(0, ILogService)), ( __param(1, IEnvironmentService))], LanguageFeatureDebounceService));

export { LanguageFeatureDebounceService };
