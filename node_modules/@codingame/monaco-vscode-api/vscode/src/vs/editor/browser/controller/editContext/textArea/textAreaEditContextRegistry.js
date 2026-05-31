

class TextAreaEditContextRegistryImpl {
    constructor() {
        this._textAreaEditContextMapping = ( new Map());
    }
    register(ownerID, textAreaEditContext) {
        this._textAreaEditContextMapping.set(ownerID, textAreaEditContext);
        return {
            dispose: () => {
                this._textAreaEditContextMapping.delete(ownerID);
            }
        };
    }
    get(ownerID) {
        return this._textAreaEditContextMapping.get(ownerID);
    }
}
const TextAreaEditContextRegistry = ( new TextAreaEditContextRegistryImpl());

export { TextAreaEditContextRegistry };
