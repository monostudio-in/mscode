
import { ConvenientObservable } from './baseObservable.js';

function constObservable(value) {
    return ( new ConstObservable(value));
}
class ConstObservable extends ConvenientObservable {
    constructor(value) {
        super();
        this.value = value;
    }
    get debugName() {
        return ( this.toString());
    }
    get() {
        return this.value;
    }
    addObserver(observer) {}
    removeObserver(observer) {}
    log() {
        return this;
    }
    toString() {
        return `Const: ${this.value}`;
    }
}

export { constObservable };
