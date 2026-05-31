

var LinePartMetadata;
(function (LinePartMetadata) {
    LinePartMetadata[LinePartMetadata["IS_WHITESPACE"] = 1] = "IS_WHITESPACE";
    LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE"] = 2] = "PSEUDO_BEFORE";
    LinePartMetadata[LinePartMetadata["PSEUDO_AFTER"] = 4] = "PSEUDO_AFTER";
    LinePartMetadata[LinePartMetadata["IS_WHITESPACE_MASK"] = 1] = "IS_WHITESPACE_MASK";
    LinePartMetadata[LinePartMetadata["PSEUDO_BEFORE_MASK"] = 2] = "PSEUDO_BEFORE_MASK";
    LinePartMetadata[LinePartMetadata["PSEUDO_AFTER_MASK"] = 4] = "PSEUDO_AFTER_MASK";
})(LinePartMetadata || (LinePartMetadata = {}));
class LinePart {
    constructor(
    endIndex, type, metadata, containsRTL) {
        this.endIndex = endIndex;
        this.type = type;
        this.metadata = metadata;
        this.containsRTL = containsRTL;
        this._linePartBrand = undefined;
    }
    isWhitespace() {
        return (this.metadata & LinePartMetadata.IS_WHITESPACE_MASK ? true : false);
    }
    isPseudoAfter() {
        return (this.metadata & LinePartMetadata.PSEUDO_AFTER_MASK ? true : false);
    }
}

export { LinePart, LinePartMetadata };
