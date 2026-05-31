
import './observableInternal/index.js';
import { constObservable } from './observableInternal/observables/constObservable.js';

function readHotReloadableExport(value, reader) {
    return value;
}
function createHotClass(clazz) {
    {
        return constObservable(clazz);
    }
}

export { createHotClass, readHotReloadableExport };
