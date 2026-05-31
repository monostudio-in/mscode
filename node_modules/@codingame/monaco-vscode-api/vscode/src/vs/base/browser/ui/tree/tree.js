
import '../list/list.js';

var TreeVisibility;
(function(TreeVisibility) {
    TreeVisibility[TreeVisibility["Hidden"] = 0] = "Hidden";
    TreeVisibility[TreeVisibility["Visible"] = 1] = "Visible";
    TreeVisibility[TreeVisibility["Recurse"] = 2] = "Recurse";
})(TreeVisibility || (TreeVisibility = {}));
var ObjectTreeElementCollapseState;
(function(ObjectTreeElementCollapseState) {
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Expanded"] = 0] = "Expanded";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Collapsed"] = 1] = "Collapsed";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrCollapsed"] = 3] = "PreserveOrCollapsed";
})(ObjectTreeElementCollapseState || (ObjectTreeElementCollapseState = {}));
var TreeMouseEventTarget;
(function(TreeMouseEventTarget) {
    TreeMouseEventTarget[TreeMouseEventTarget["Unknown"] = 0] = "Unknown";
    TreeMouseEventTarget[TreeMouseEventTarget["Twistie"] = 1] = "Twistie";
    TreeMouseEventTarget[TreeMouseEventTarget["Element"] = 2] = "Element";
    TreeMouseEventTarget[TreeMouseEventTarget["Filter"] = 3] = "Filter";
})(TreeMouseEventTarget || (TreeMouseEventTarget = {}));
var TreeDragOverBubble;
(function(TreeDragOverBubble) {
    TreeDragOverBubble[TreeDragOverBubble["Down"] = 0] = "Down";
    TreeDragOverBubble[TreeDragOverBubble["Up"] = 1] = "Up";
})(TreeDragOverBubble || (TreeDragOverBubble = {}));
class TreeError extends Error {
    constructor(user, message) {
        super(`TreeError [${user}] ${message}`);
    }
}
class WeakMapper {
    constructor(fn) {
        this.fn = fn;
        this._map = ( new WeakMap());
    }
    map(key) {
        let result = this._map.get(key);
        if (!result) {
            result = this.fn(key);
            this._map.set(key, result);
        }
        return result;
    }
}

export { ObjectTreeElementCollapseState, TreeDragOverBubble, TreeError, TreeMouseEventTarget, TreeVisibility, WeakMapper };
