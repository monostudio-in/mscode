
import '../../../base/common/observableInternal/index.js';
import '../../instantiation/common/instantiation.js';

function hotClassGetOriginalInstance(value) {
    if (value instanceof BaseClass) {
        return value._instance;
    }
    return value;
}
class BaseClass {
    constructor(instantiationService) {
        this.instantiationService = instantiationService;
    }
    init(...params) {}
}
function wrapInHotClass1(clazz) {
    return clazz.get() ;
}

export { hotClassGetOriginalInstance, wrapInHotClass1 };
