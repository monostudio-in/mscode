
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';

var OutlineSortOrder;
(function(OutlineSortOrder) {
    OutlineSortOrder[OutlineSortOrder["ByPosition"] = 0] = "ByPosition";
    OutlineSortOrder[OutlineSortOrder["ByName"] = 1] = "ByName";
    OutlineSortOrder[OutlineSortOrder["ByKind"] = 2] = "ByKind";
})(OutlineSortOrder || (OutlineSortOrder = {}));
var IOutlinePane;
(function(IOutlinePane) {
    IOutlinePane.Id = "outline";
})(IOutlinePane || (IOutlinePane = {}));
const ctxFollowsCursor = ( new RawContextKey("outlineFollowsCursor", false));
const ctxFilterOnType = ( new RawContextKey("outlineFiltersOnType", false));
const ctxSortMode = ( new RawContextKey("outlineSortMode", OutlineSortOrder.ByPosition));
const ctxAllCollapsed = ( new RawContextKey("outlineAllCollapsed", false));
const ctxFocused = ( new RawContextKey("outlineFocused", true));

export { IOutlinePane, OutlineSortOrder, ctxAllCollapsed, ctxFilterOnType, ctxFocused, ctxFollowsCursor, ctxSortMode };
