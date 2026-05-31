
import { Iterable } from '../../../../base/common/iterator.js';
import { isWindows, isMacintosh, isLinux } from '../../../../base/common/platform.js';

class ConfigurationResolverExpression {
    static {
        this.VARIABLE_LHS = "${";
    }
    constructor(object) {
        this.locations = ( new Map());
        this.newReplacementNotifiers = ( new Set());
        if (typeof object === "string") {
            this.stringRoot = true;
            this.root = {
                value: object
            };
        } else {
            this.stringRoot = false;
            this.root = structuredClone(object);
        }
    }
    static parse(object) {
        if (object instanceof ConfigurationResolverExpression) {
            return object;
        }
        const expr = ( new ConfigurationResolverExpression(object));
        expr.applyPlatformSpecificKeys();
        expr.parseObject(expr.root);
        return expr;
    }
    applyPlatformSpecificKeys() {
        const config = this.root;
        const key = isWindows ? "windows" : isMacintosh ? "osx" : isLinux ? "linux" : undefined;
        if (key && config && typeof config === "object" && config.hasOwnProperty(key)) {
            ( Object.keys(config[key])).forEach(k => config[k] = config[key][k]);
        }
        delete config.windows;
        delete config.osx;
        delete config.linux;
    }
    parseVariable(str, start) {
        if (str[start] !== "$" || str[start + 1] !== "{") {
            return undefined;
        }
        let end = start + 2;
        let braceCount = 1;
        while (end < str.length) {
            if (str[end] === "{") {
                braceCount++;
            } else if (str[end] === "}") {
                braceCount--;
                if (braceCount === 0) {
                    break;
                }
            }
            end++;
        }
        if (braceCount !== 0) {
            return undefined;
        }
        const id = str.slice(start, end + 1);
        const inner = str.substring(start + 2, end);
        const colonIdx = inner.indexOf(":");
        if (colonIdx === -1) {
            return {
                replacement: {
                    id,
                    name: inner,
                    inner
                },
                end
            };
        }
        return {
            replacement: {
                id,
                inner,
                name: inner.slice(0, colonIdx),
                arg: inner.slice(colonIdx + 1)
            },
            end
        };
    }
    parseObject(obj) {
        if (typeof obj !== "object" || obj === null) {
            return;
        }
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const value = obj[i];
                if (typeof value === "string") {
                    this.parseString(obj, i, value);
                } else {
                    this.parseObject(value);
                }
            }
            return;
        }
        for (const [key, value] of Object.entries(obj)) {
            this.parseString(obj, key, key, true);
            if (typeof value === "string") {
                this.parseString(obj, key, value);
            } else {
                this.parseObject(value);
            }
        }
    }
    parseString(object, propertyName, value, replaceKeyName, replacementPath) {
        let pos = 0;
        while (pos < value.length) {
            const match = value.indexOf("${", pos);
            if (match === -1) {
                break;
            }
            const parsed = this.parseVariable(value, match);
            if (parsed) {
                pos = parsed.end + 1;
                if (replacementPath?.includes(parsed.replacement.id)) {
                    continue;
                }
                const locations = this.locations.get(parsed.replacement.id) || {
                    locations: [],
                    replacement: parsed.replacement
                };
                const newLocation = {
                    object,
                    propertyName,
                    replaceKeyName
                };
                locations.locations.push(newLocation);
                this.locations.set(parsed.replacement.id, locations);
                if (locations.resolved) {
                    this._resolveAtLocation(parsed.replacement, newLocation, locations.resolved, replacementPath);
                } else {
                    this.newReplacementNotifiers.forEach(n => n(parsed.replacement));
                }
            } else {
                pos = match + 2;
            }
        }
    }
    *unresolved() {
        const newReplacements = ( new Map());
        const notifier = replacement => {
            newReplacements.set(replacement.id, replacement);
        };
        for (const location of ( this.locations.values())) {
            if (location.resolved === undefined) {
                newReplacements.set(location.replacement.id, location.replacement);
            }
        }
        this.newReplacementNotifiers.add(notifier);
        while (true) {
            const next = Iterable.first(newReplacements);
            if (!next) {
                break;
            }
            const [key, value] = next;
            yield value;
            newReplacements.delete(key);
        }
        this.newReplacementNotifiers.delete(notifier);
    }
    resolved() {
        return ( Iterable.map(Iterable.filter(( this.locations.values()), l => !!l.resolved), l => [l.replacement, l.resolved]));
    }
    resolve(replacement, data) {
        if (typeof data !== "object") {
            data = {
                value: String(data)
            };
        }
        const location = this.locations.get(replacement.id);
        if (!location) {
            return;
        }
        location.resolved = data;
        if (data.value !== undefined) {
            for (const l of location.locations || Iterable.empty()) {
                this._resolveAtLocation(replacement, l, data);
            }
        }
    }
    _resolveAtLocation(
        replacement,
        {
            replaceKeyName,
            propertyName,
            object
        },
        data,
        path = []
    ) {
        if (data.value === undefined) {
            return;
        }
        path.push(replacement.id);
        if (replaceKeyName && typeof propertyName === "string") {
            const value = object[propertyName];
            const newKey = propertyName.replaceAll(replacement.id, data.value);
            delete object[propertyName];
            object[newKey] = value;
            this._renameKeyInLocations(object, propertyName, newKey);
            this.parseString(object, newKey, data.value, true, path);
        } else {
            object[propertyName] = object[propertyName].replaceAll(replacement.id, data.value);
            this.parseString(object, propertyName, data.value, false, path);
        }
        path.pop();
    }
    _renameKeyInLocations(obj, oldKey, newKey) {
        for (const location of ( this.locations.values())) {
            for (const loc of location.locations) {
                if (loc.object === obj && loc.propertyName === oldKey) {
                    loc.propertyName = newKey;
                }
            }
        }
    }
    toObject() {
        if (this.stringRoot) {
            return this.root.value;
        }
        return this.root;
    }
}

export { ConfigurationResolverExpression };
