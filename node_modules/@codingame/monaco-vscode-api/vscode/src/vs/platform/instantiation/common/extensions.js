
import { SyncDescriptor } from './descriptors.js';

const _registry = [];
var InstantiationType;
(function(InstantiationType) {
    InstantiationType[InstantiationType["Eager"] = 0] = "Eager";
    InstantiationType[InstantiationType["Delayed"] = 1] = "Delayed";
})(InstantiationType || (InstantiationType = {}));
function registerSingleton(id, ctorOrDescriptor, supportsDelayedInstantiation) {
    if (!(ctorOrDescriptor instanceof SyncDescriptor)) {
        ctorOrDescriptor = ( new SyncDescriptor(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation)));
    }
    _registry.push([id, ctorOrDescriptor]);
}
function getSingletonServiceDescriptors() {
    return _registry;
}

export { InstantiationType, getSingletonServiceDescriptors, registerSingleton };
