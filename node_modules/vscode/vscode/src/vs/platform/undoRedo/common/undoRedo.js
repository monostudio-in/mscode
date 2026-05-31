

var UndoRedoElementType;
(function(UndoRedoElementType) {
    UndoRedoElementType[UndoRedoElementType["Resource"] = 0] = "Resource";
    UndoRedoElementType[UndoRedoElementType["Workspace"] = 1] = "Workspace";
})(UndoRedoElementType || (UndoRedoElementType = {}));
class ResourceEditStackSnapshot {
    constructor(resource, elements) {
        this.resource = resource;
        this.elements = elements;
    }
}
class UndoRedoGroup {
    static {
        this._ID = 0;
    }
    constructor() {
        this.id = UndoRedoGroup._ID++;
        this.order = 1;
    }
    nextOrder() {
        if (this.id === 0) {
            return 0;
        }
        return this.order++;
    }
    static {
        this.None = ( new UndoRedoGroup());
    }
}
class UndoRedoSource {
    static {
        this._ID = 0;
    }
    constructor() {
        this.id = UndoRedoSource._ID++;
        this.order = 1;
    }
    nextOrder() {
        if (this.id === 0) {
            return 0;
        }
        return this.order++;
    }
    static {
        this.None = ( new UndoRedoSource());
    }
}

export { ResourceEditStackSnapshot, UndoRedoElementType, UndoRedoGroup, UndoRedoSource };
