
import { Registry } from '../../../../platform/registry/common/platform.js';

var Extensions;
(function(Extensions) {
    Extensions.ExtensionFeaturesRegistry = "workbench.registry.extensionFeatures";
})(Extensions || (Extensions = {}));
class ExtensionFeaturesRegistry {
    constructor() {
        this.extensionFeatures = ( new Map());
    }
    registerExtensionFeature(descriptor) {
        if (( this.extensionFeatures.has(descriptor.id))) {
            throw ( new Error(`Extension feature with id '${descriptor.id}' already exists`));
        }
        this.extensionFeatures.set(descriptor.id, descriptor);
        return {
            dispose: () => this.extensionFeatures.delete(descriptor.id)
        };
    }
    getExtensionFeature(id) {
        return this.extensionFeatures.get(id);
    }
    getExtensionFeatures() {
        return Array.from(( this.extensionFeatures.values()));
    }
}
Registry.add(Extensions.ExtensionFeaturesRegistry, ( new ExtensionFeaturesRegistry()));

export { Extensions };
