
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import '../../instantiation/common/instantiation.js';
import { URI } from '../../../base/common/uri.js';
import '../../instantiation/common/extensions.js';
import { FileSystemProviderCapabilities } from '../../files/common/files.js';
import { IFileService } from '../../files/common/files.service.js';
import { ExtUri, normalizePath } from '../../../base/common/resources.js';
import { Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { quickSelect } from '../../../base/common/arrays.js';

class Entry {
    static {
        this._clock = 0;
    }
    constructor(uri) {
        this.uri = uri;
        this.time = Entry._clock++;
    }
    touch() {
        this.time = Entry._clock++;
        return this;
    }
}
let UriIdentityService = class UriIdentityService {
    constructor(_fileService) {
        this._fileService = _fileService;
        this._dispooables = ( new DisposableStore());
        this._limit = 2 ** 16;
        const schemeIgnoresPathCasingCache = ( new Map());
        const ignorePathCasing = uri => {
            let ignorePathCasing = schemeIgnoresPathCasingCache.get(uri.scheme);
            if (ignorePathCasing === undefined) {
                ignorePathCasing = _fileService.hasProvider(uri) && !this._fileService.hasCapability(uri, FileSystemProviderCapabilities.PathCaseSensitive);
                schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing);
            }
            return ignorePathCasing;
        };
        this._dispooables.add(Event.any(
            _fileService.onDidChangeFileSystemProviderRegistrations,
            _fileService.onDidChangeFileSystemProviderCapabilities
        )(e => {
            const oldIgnorePathCasingValue = schemeIgnoresPathCasingCache.get(e.scheme);
            if (oldIgnorePathCasingValue === undefined) {
                return;
            }
            schemeIgnoresPathCasingCache.delete(e.scheme);
            const newIgnorePathCasingValue = ignorePathCasing(( URI.from({
                scheme: e.scheme
            })));
            if (newIgnorePathCasingValue === newIgnorePathCasingValue) {
                return;
            }
            for (const [key, entry] of this._canonicalUris.entries()) {
                if (entry.uri.scheme !== e.scheme) {
                    continue;
                }
                this._canonicalUris.delete(key);
            }
        }));
        this.extUri = ( new ExtUri(ignorePathCasing));
        this._canonicalUris = ( new Map());
    }
    dispose() {
        this._dispooables.dispose();
        this._canonicalUris.clear();
    }
    asCanonicalUri(uri) {
        if (this._fileService.hasProvider(uri)) {
            uri = normalizePath(uri);
        }
        const uriKey = this.extUri.getComparisonKey(uri, true);
        const item = this._canonicalUris.get(uriKey);
        if (item) {
            return item.touch().uri.with({
                fragment: uri.fragment
            });
        }
        this._canonicalUris.set(uriKey, ( new Entry(uri)));
        this._checkTrim();
        return uri;
    }
    _checkTrim() {
        if (this._canonicalUris.size < this._limit) {
            return;
        }
        Entry._clock = 1;
        const times = ( [...( this._canonicalUris.values())].map(e => e.time));
        const median = quickSelect(Math.floor(times.length / 2), times, (a, b) => a - b);
        for (const [key, entry] of this._canonicalUris.entries()) {
            if (entry.time <= median) {
                this._canonicalUris.delete(key);
            } else {
                entry.time = 0;
            }
        }
    }
};
UriIdentityService = ( __decorate([( __param(0, IFileService))], UriIdentityService));

export { UriIdentityService };
