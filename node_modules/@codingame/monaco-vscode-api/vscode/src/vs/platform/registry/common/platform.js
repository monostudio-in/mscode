
import { ok } from '../../../base/common/assert.js';
import { isString, isObject, isFunction } from '../../../base/common/types.js';

class RegistryImpl {
    constructor() {
        this.data = ( new Map());
    }
    add(id, data) {
        ok(isString(id));
        ok(isObject(data));
        ok(!( this.data.has(id)), "There is already an extension with this id");
        this.data.set(id, data);
    }
    knows(id) {
        return ( this.data.has(id));
    }
    as(id) {
        return this.data.get(id) || null;
    }
    dispose() {
        this.data.forEach(value => {
            if (isFunction(value.dispose)) {
                value.dispose();
            }
        });
        this.data.clear();
    }
}
const Registry = ( new RegistryImpl());

export { Registry };
