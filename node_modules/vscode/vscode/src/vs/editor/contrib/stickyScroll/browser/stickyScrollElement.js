

class StickyRange {
    constructor(startLineNumber, endLineNumber) {
        this.startLineNumber = startLineNumber;
        this.endLineNumber = endLineNumber;
    }
}
class StickyElement {
    constructor(
    range,
    children,
    parent) {
        this.range = range;
        this.children = children;
        this.parent = parent;
    }
}
class StickyModel {
    constructor(uri, version, element, outlineProviderId) {
        this.uri = uri;
        this.version = version;
        this.element = element;
        this.outlineProviderId = outlineProviderId;
    }
}

export { StickyElement, StickyModel, StickyRange };
