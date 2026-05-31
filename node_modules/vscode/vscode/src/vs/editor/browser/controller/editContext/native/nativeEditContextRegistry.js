

class NativeEditContextRegistryImpl {
    constructor() {
        this._nativeEditContextMapping = ( new Map());
    }
    register(ownerID, nativeEditContext) {
        this._nativeEditContextMapping.set(ownerID, nativeEditContext);
        return {
            dispose: () => {
                this._nativeEditContextMapping.delete(ownerID);
            }
        };
    }
    get(ownerID) {
        return this._nativeEditContextMapping.get(ownerID);
    }
}
const NativeEditContextRegistry = ( new NativeEditContextRegistryImpl());

export { NativeEditContextRegistry };
