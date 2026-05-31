
import { distinct } from './arrays.js';
import { Iterable } from './iterator.js';
import { generateUuid } from './uuid.js';

function createStringDataTransferItem(stringOrPromise, id) {
    return {
        id,
        asString: async () => stringOrPromise,
        asFile: () => undefined,
        value: typeof stringOrPromise === "string" ? stringOrPromise : undefined
    };
}
function createFileDataTransferItem(fileName, uri, data, id) {
    const file = {
        id: generateUuid(),
        name: fileName,
        uri,
        data
    };
    return {
        id,
        asString: async () => "",
        asFile: () => file,
        value: undefined
    };
}
class VSDataTransfer {
    constructor() {
        this._entries = ( new Map());
    }
    get size() {
        let size = 0;
        for (const _ of this._entries) {
            size++;
        }
        return size;
    }
    has(mimeType) {
        return ( this._entries.has(this.toKey(mimeType)));
    }
    matches(pattern) {
        const mimes = [...( this._entries.keys())];
        if (( Iterable.some(this, ([_, item]) => item.asFile()))) {
            mimes.push("files");
        }
        return matchesMimeType_normalized(normalizeMimeType(pattern), mimes);
    }
    get(mimeType) {
        return this._entries.get(this.toKey(mimeType))?.[0];
    }
    append(mimeType, value) {
        const existing = this._entries.get(mimeType);
        if (existing) {
            existing.push(value);
        } else {
            this._entries.set(this.toKey(mimeType), [value]);
        }
    }
    replace(mimeType, value) {
        this._entries.set(this.toKey(mimeType), [value]);
    }
    delete(mimeType) {
        this._entries.delete(this.toKey(mimeType));
    }
    *[Symbol.iterator]() {
        for (const [mine, items] of this._entries) {
            for (const item of items) {
                yield [mine, item];
            }
        }
    }
    toKey(mimeType) {
        return normalizeMimeType(mimeType);
    }
}
function normalizeMimeType(mimeType) {
    return mimeType.toLowerCase();
}
function matchesMimeType(pattern, mimeTypes) {
    return matchesMimeType_normalized(normalizeMimeType(pattern), ( mimeTypes.map(normalizeMimeType)));
}
function matchesMimeType_normalized(normalizedPattern, normalizedMimeTypes) {
    if (normalizedPattern === "*/*") {
        return normalizedMimeTypes.length > 0;
    }
    if (normalizedMimeTypes.includes(normalizedPattern)) {
        return true;
    }
    const wildcard = normalizedPattern.match(/^([a-z]+)\/([a-z]+|\*)$/i);
    if (!wildcard) {
        return false;
    }
    const [_, type, subtype] = wildcard;
    if (subtype === "*") {
        return ( normalizedMimeTypes.some(mime => mime.startsWith(type + "/")));
    }
    return false;
}
const UriList = ( Object.freeze({
    create: entries => {
        return distinct(( entries.map(x => ( x.toString())))).join("\r\n");
    },
    split: str => {
        return str.split("\r\n");
    },
    parse: str => {
        return UriList.split(str).filter(value => !value.startsWith("#"));
    }
}));

export { UriList, VSDataTransfer, createFileDataTransferItem, createStringDataTransferItem, matchesMimeType };
