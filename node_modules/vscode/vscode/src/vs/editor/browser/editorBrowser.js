
import { EditorType } from '../common/editorCommon.js';

var ContentWidgetPositionPreference;
(function (ContentWidgetPositionPreference) {
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["EXACT"] = 0] = "EXACT";
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["ABOVE"] = 1] = "ABOVE";
    ContentWidgetPositionPreference[ContentWidgetPositionPreference["BELOW"] = 2] = "BELOW";
})(ContentWidgetPositionPreference || (ContentWidgetPositionPreference = {}));
var OverlayWidgetPositionPreference;
(function (OverlayWidgetPositionPreference) {
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
    OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_CENTER"] = 2] = "TOP_CENTER";
})(OverlayWidgetPositionPreference || (OverlayWidgetPositionPreference = {}));
var MouseTargetType;
(function (MouseTargetType) {
    MouseTargetType[MouseTargetType["UNKNOWN"] = 0] = "UNKNOWN";
    MouseTargetType[MouseTargetType["TEXTAREA"] = 1] = "TEXTAREA";
    MouseTargetType[MouseTargetType["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
    MouseTargetType[MouseTargetType["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
    MouseTargetType[MouseTargetType["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
    MouseTargetType[MouseTargetType["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
    MouseTargetType[MouseTargetType["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
    MouseTargetType[MouseTargetType["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
    MouseTargetType[MouseTargetType["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
    MouseTargetType[MouseTargetType["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
    MouseTargetType[MouseTargetType["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
    MouseTargetType[MouseTargetType["SCROLLBAR"] = 11] = "SCROLLBAR";
    MouseTargetType[MouseTargetType["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
    MouseTargetType[MouseTargetType["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
})(MouseTargetType || (MouseTargetType = {}));
var DiffEditorState;
(function (DiffEditorState) {
    DiffEditorState[DiffEditorState["Idle"] = 0] = "Idle";
    DiffEditorState[DiffEditorState["ComputingDiff"] = 1] = "ComputingDiff";
    DiffEditorState[DiffEditorState["DiffComputed"] = 2] = "DiffComputed";
})(DiffEditorState || (DiffEditorState = {}));
function isCodeEditor(thing) {
    if (thing && typeof thing.getEditorType === 'function') {
        return thing.getEditorType() === EditorType.ICodeEditor;
    }
    else {
        return false;
    }
}
function isDiffEditor(thing) {
    if (thing && typeof thing.getEditorType === 'function') {
        return thing.getEditorType() === EditorType.IDiffEditor;
    }
    else {
        return false;
    }
}
function isCompositeEditor(thing) {
    return !!thing
        && typeof thing === 'object'
        && typeof thing.onDidChangeActiveEditor === 'function';
}
function getCodeEditor(thing) {
    if (isCodeEditor(thing)) {
        return thing;
    }
    if (isDiffEditor(thing)) {
        return thing.getModifiedEditor();
    }
    if (isCompositeEditor(thing) && isCodeEditor(thing.activeCodeEditor)) {
        return thing.activeCodeEditor;
    }
    return null;
}
function getIEditor(thing) {
    if (isCodeEditor(thing) || isDiffEditor(thing)) {
        return thing;
    }
    return null;
}

export { ContentWidgetPositionPreference, DiffEditorState, MouseTargetType, OverlayWidgetPositionPreference, getCodeEditor, getIEditor, isCodeEditor, isCompositeEditor, isDiffEditor };
