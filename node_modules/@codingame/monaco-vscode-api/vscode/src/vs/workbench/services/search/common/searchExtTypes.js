

class TextSearchMatch2 {
    constructor(uri, ranges, previewText) {
        this.uri = uri;
        this.ranges = ranges;
        this.previewText = previewText;
    }
}
class TextSearchContext2 {
    constructor(uri, text, lineNumber) {
        this.uri = uri;
        this.text = text;
        this.lineNumber = lineNumber;
    }
}
class AISearchKeyword {
    constructor(keyword) {
        this.keyword = keyword;
    }
}
var ExcludeSettingOptions;
(function(ExcludeSettingOptions) {
    ExcludeSettingOptions[ExcludeSettingOptions["None"] = 1] = "None";
    ExcludeSettingOptions[ExcludeSettingOptions["FilesExclude"] = 2] = "FilesExclude";
    ExcludeSettingOptions[ExcludeSettingOptions["SearchAndFilesExclude"] = 3] = "SearchAndFilesExclude";
})(ExcludeSettingOptions || (ExcludeSettingOptions = {}));
var TextSearchCompleteMessageType;
(function(TextSearchCompleteMessageType) {
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Information"] = 1] = "Information";
    TextSearchCompleteMessageType[TextSearchCompleteMessageType["Warning"] = 2] = "Warning";
})(TextSearchCompleteMessageType || (TextSearchCompleteMessageType = {}));

export { AISearchKeyword, ExcludeSettingOptions, TextSearchCompleteMessageType, TextSearchContext2, TextSearchMatch2 };
