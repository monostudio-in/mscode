
import { LRUCache } from './map.js';

const nfdCache = ( new LRUCache(10000));
function normalizeNFD(str) {
    return normalize(str, "NFD", nfdCache);
}
const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;
function normalize(str, form, normalizedCache) {
    if (!str) {
        return str;
    }
    const cached = normalizedCache.get(str);
    if (cached) {
        return cached;
    }
    let res;
    if (nonAsciiCharactersPattern.test(str)) {
        res = str.normalize(form);
    } else {
        res = str;
    }
    normalizedCache.set(str, res);
    return res;
}
const tryNormalizeToBase = function() {
    const cache = ( new LRUCache(10000));
    const accentsRegex = /[\u0300-\u036f]/g;
    return function(str) {
        const cached = cache.get(str);
        if (cached) {
            return cached;
        }
        const noAccents = normalizeNFD(str).replace(accentsRegex, "");
        const result = (noAccents.length === str.length ? noAccents : str).toLowerCase();
        cache.set(str, result);
        return result;
    };
}();

export { normalizeNFD, tryNormalizeToBase };
