

var ScrollType;
(function (ScrollType) {
    ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
    ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
})(ScrollType || (ScrollType = {}));
function isThemeColor(o) {
    return !!o && typeof o.id === 'string';
}
const EditorType = {
    ICodeEditor: 'vs.editor.ICodeEditor',
    IDiffEditor: 'vs.editor.IDiffEditor'
};
var Handler;
(function (Handler) {
    Handler["CompositionStart"] = "compositionStart";
    Handler["CompositionEnd"] = "compositionEnd";
    Handler["Type"] = "type";
    Handler["ReplacePreviousChar"] = "replacePreviousChar";
    Handler["CompositionType"] = "compositionType";
    Handler["Paste"] = "paste";
    Handler["Cut"] = "cut";
})(Handler || (Handler = {}));

export { EditorType, Handler, ScrollType, isThemeColor };
