

var HoverAnchorType;
(function (HoverAnchorType) {
    HoverAnchorType[HoverAnchorType["Range"] = 1] = "Range";
    HoverAnchorType[HoverAnchorType["ForeignElement"] = 2] = "ForeignElement";
})(HoverAnchorType || (HoverAnchorType = {}));
class HoverRangeAnchor {
    constructor(priority, range, initialMousePosX, initialMousePosY) {
        this.priority = priority;
        this.range = range;
        this.initialMousePosX = initialMousePosX;
        this.initialMousePosY = initialMousePosY;
        this.type = HoverAnchorType.Range;
    }
    equals(other) {
        return (other.type === HoverAnchorType.Range && this.range.equalsRange(other.range));
    }
    canAdoptVisibleHover(lastAnchor, showAtPosition) {
        return (lastAnchor.type === HoverAnchorType.Range && showAtPosition.lineNumber === this.range.startLineNumber);
    }
}
class HoverForeignElementAnchor {
    constructor(priority, owner, range, initialMousePosX, initialMousePosY, supportsMarkerHover) {
        this.priority = priority;
        this.owner = owner;
        this.range = range;
        this.initialMousePosX = initialMousePosX;
        this.initialMousePosY = initialMousePosY;
        this.supportsMarkerHover = supportsMarkerHover;
        this.type = HoverAnchorType.ForeignElement;
    }
    equals(other) {
        return (other.type === HoverAnchorType.ForeignElement && this.owner === other.owner);
    }
    canAdoptVisibleHover(lastAnchor, showAtPosition) {
        return (lastAnchor.type === HoverAnchorType.ForeignElement && this.owner === lastAnchor.owner);
    }
}
class RenderedHoverParts {
    constructor(renderedHoverParts, disposables) {
        this.renderedHoverParts = renderedHoverParts;
        this.disposables = disposables;
    }
    dispose() {
        for (const part of this.renderedHoverParts) {
            part.dispose();
        }
        this.disposables?.dispose();
    }
}
const HoverParticipantRegistry = (new class HoverParticipantRegistry {
    constructor() {
        this._participants = [];
    }
    register(ctor) {
        this._participants.push(ctor);
    }
    getAll() {
        return this._participants;
    }
}());

export { HoverAnchorType, HoverForeignElementAnchor, HoverParticipantRegistry, HoverRangeAnchor, RenderedHoverParts };
