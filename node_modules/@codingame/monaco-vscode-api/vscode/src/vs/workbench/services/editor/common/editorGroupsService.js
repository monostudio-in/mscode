
import { isEditorInput } from '../../../common/editor.js';

var GroupActivationReason;
(function (GroupActivationReason) {
    GroupActivationReason[GroupActivationReason["DEFAULT"] = 0] = "DEFAULT";
    GroupActivationReason[GroupActivationReason["PART_CLOSE"] = 1] = "PART_CLOSE";
})(GroupActivationReason || (GroupActivationReason = {}));
var GroupDirection;
(function (GroupDirection) {
    GroupDirection[GroupDirection["UP"] = 0] = "UP";
    GroupDirection[GroupDirection["DOWN"] = 1] = "DOWN";
    GroupDirection[GroupDirection["LEFT"] = 2] = "LEFT";
    GroupDirection[GroupDirection["RIGHT"] = 3] = "RIGHT";
})(GroupDirection || (GroupDirection = {}));
var GroupOrientation;
(function (GroupOrientation) {
    GroupOrientation[GroupOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
    GroupOrientation[GroupOrientation["VERTICAL"] = 1] = "VERTICAL";
})(GroupOrientation || (GroupOrientation = {}));
var GroupLocation;
(function (GroupLocation) {
    GroupLocation[GroupLocation["FIRST"] = 0] = "FIRST";
    GroupLocation[GroupLocation["LAST"] = 1] = "LAST";
    GroupLocation[GroupLocation["NEXT"] = 2] = "NEXT";
    GroupLocation[GroupLocation["PREVIOUS"] = 3] = "PREVIOUS";
})(GroupLocation || (GroupLocation = {}));
var GroupsArrangement;
(function (GroupsArrangement) {
    GroupsArrangement[GroupsArrangement["MAXIMIZE"] = 0] = "MAXIMIZE";
    GroupsArrangement[GroupsArrangement["EXPAND"] = 1] = "EXPAND";
    GroupsArrangement[GroupsArrangement["EVEN"] = 2] = "EVEN";
})(GroupsArrangement || (GroupsArrangement = {}));
var MergeGroupMode;
(function (MergeGroupMode) {
    MergeGroupMode[MergeGroupMode["COPY_EDITORS"] = 0] = "COPY_EDITORS";
    MergeGroupMode[MergeGroupMode["MOVE_EDITORS"] = 1] = "MOVE_EDITORS";
})(MergeGroupMode || (MergeGroupMode = {}));
function isEditorReplacement(replacement) {
    const candidate = replacement;
    return isEditorInput(candidate?.editor) && isEditorInput(candidate?.replacement);
}
var GroupsOrder;
(function (GroupsOrder) {
    GroupsOrder[GroupsOrder["CREATION_TIME"] = 0] = "CREATION_TIME";
    GroupsOrder[GroupsOrder["MOST_RECENTLY_ACTIVE"] = 1] = "MOST_RECENTLY_ACTIVE";
    GroupsOrder[GroupsOrder["GRID_APPEARANCE"] = 2] = "GRID_APPEARANCE";
})(GroupsOrder || (GroupsOrder = {}));
var OpenEditorContext;
(function (OpenEditorContext) {
    OpenEditorContext[OpenEditorContext["NEW_EDITOR"] = 1] = "NEW_EDITOR";
    OpenEditorContext[OpenEditorContext["MOVE_EDITOR"] = 2] = "MOVE_EDITOR";
    OpenEditorContext[OpenEditorContext["COPY_EDITOR"] = 3] = "COPY_EDITOR";
})(OpenEditorContext || (OpenEditorContext = {}));
function isEditorGroup(obj) {
    const group = obj;
    return !!group && typeof group.id === 'number' && Array.isArray(group.editors);
}
function preferredSideBySideGroupDirection(configurationService) {
    const openSideBySideDirection = configurationService.getValue('workbench.editor.openSideBySideDirection');
    if (openSideBySideDirection === 'down') {
        return GroupDirection.DOWN;
    }
    return GroupDirection.RIGHT;
}

export { GroupActivationReason, GroupDirection, GroupLocation, GroupOrientation, GroupsArrangement, GroupsOrder, MergeGroupMode, OpenEditorContext, isEditorGroup, isEditorReplacement, preferredSideBySideGroupDirection };
