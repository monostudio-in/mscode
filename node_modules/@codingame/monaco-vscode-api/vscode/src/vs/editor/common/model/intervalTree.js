
import { TrackedRangeStickiness } from '../model.js';

var ClassName;
(function(ClassName) {
    ClassName["EditorHintDecoration"] = "squiggly-hint";
    ClassName["EditorInfoDecoration"] = "squiggly-info";
    ClassName["EditorWarningDecoration"] = "squiggly-warning";
    ClassName["EditorErrorDecoration"] = "squiggly-error";
    ClassName["EditorUnnecessaryDecoration"] = "squiggly-unnecessary";
    ClassName["EditorUnnecessaryInlineDecoration"] = "squiggly-inline-unnecessary";
    ClassName["EditorDeprecatedInlineDecoration"] = "squiggly-inline-deprecated";
})(ClassName || (ClassName = {}));
var NodeColor;
(function(NodeColor) {
    NodeColor[NodeColor["Black"] = 0] = "Black";
    NodeColor[NodeColor["Red"] = 1] = "Red";
})(NodeColor || (NodeColor = {}));
var Constants;
(function(Constants) {
    Constants[Constants["ColorMask"] = 1] = "ColorMask";
    Constants[Constants["ColorMaskInverse"] = 254] = "ColorMaskInverse";
    Constants[Constants["ColorOffset"] = 0] = "ColorOffset";
    Constants[Constants["IsVisitedMask"] = 2] = "IsVisitedMask";
    Constants[Constants["IsVisitedMaskInverse"] = 253] = "IsVisitedMaskInverse";
    Constants[Constants["IsVisitedOffset"] = 1] = "IsVisitedOffset";
    Constants[Constants["IsForValidationMask"] = 4] = "IsForValidationMask";
    Constants[Constants["IsForValidationMaskInverse"] = 251] = "IsForValidationMaskInverse";
    Constants[Constants["IsForValidationOffset"] = 2] = "IsForValidationOffset";
    Constants[Constants["StickinessMask"] = 24] = "StickinessMask";
    Constants[Constants["StickinessMaskInverse"] = 231] = "StickinessMaskInverse";
    Constants[Constants["StickinessOffset"] = 3] = "StickinessOffset";
    Constants[Constants["CollapseOnReplaceEditMask"] = 32] = "CollapseOnReplaceEditMask";
    Constants[Constants["CollapseOnReplaceEditMaskInverse"] = 223] = "CollapseOnReplaceEditMaskInverse";
    Constants[Constants["CollapseOnReplaceEditOffset"] = 5] = "CollapseOnReplaceEditOffset";
    Constants[Constants["IsMarginMask"] = 64] = "IsMarginMask";
    Constants[Constants["IsMarginMaskInverse"] = 191] = "IsMarginMaskInverse";
    Constants[Constants["IsMarginOffset"] = 6] = "IsMarginOffset";
    Constants[Constants["AffectsFontMask"] = 128] = "AffectsFontMask";
    Constants[Constants["AffectsFontMaskInverse"] = 127] = "AffectsFontMaskInverse";
    Constants[Constants["AffectsFontOffset"] = 7] = "AffectsFontOffset";
    Constants[Constants["MIN_SAFE_DELTA"] = -1073741824] = "MIN_SAFE_DELTA";
    Constants[Constants["MAX_SAFE_DELTA"] = 1073741824] = "MAX_SAFE_DELTA";
})(Constants || (Constants = {}));
function getNodeColor(node) {
    return ((node.metadata & Constants.ColorMask) >>> Constants.ColorOffset);
}
function setNodeColor(node, color) {
    node.metadata = ((node.metadata & Constants.ColorMaskInverse) | (color << Constants.ColorOffset));
}
function getNodeIsVisited(node) {
    return ((node.metadata & Constants.IsVisitedMask) >>> Constants.IsVisitedOffset) === 1;
}
function setNodeIsVisited(node, value) {
    node.metadata = ((node.metadata & Constants.IsVisitedMaskInverse) | ((value ? 1 : 0) << Constants.IsVisitedOffset));
}
function getNodeIsForValidation(node) {
    return ((node.metadata & Constants.IsForValidationMask) >>> Constants.IsForValidationOffset) === 1;
}
function setNodeIsForValidation(node, value) {
    node.metadata = ((node.metadata & Constants.IsForValidationMaskInverse) | ((value ? 1 : 0) << Constants.IsForValidationOffset));
}
function getNodeIsInGlyphMargin(node) {
    return ((node.metadata & Constants.IsMarginMask) >>> Constants.IsMarginOffset) === 1;
}
function setNodeIsInGlyphMargin(node, value) {
    node.metadata = ((node.metadata & Constants.IsMarginMaskInverse) | ((value ? 1 : 0) << Constants.IsMarginOffset));
}
function getNodeAffectsFont(node) {
    return ((node.metadata & Constants.AffectsFontMask) >>> Constants.AffectsFontOffset) === 1;
}
function setNodeAffectsFont(node, value) {
    node.metadata = ((node.metadata & Constants.AffectsFontMaskInverse) | ((value ? 1 : 0) << Constants.AffectsFontOffset));
}
function getNodeStickiness(node) {
    return ((node.metadata & Constants.StickinessMask) >>> Constants.StickinessOffset);
}
function _setNodeStickiness(node, stickiness) {
    node.metadata = ((node.metadata & Constants.StickinessMaskInverse) | (stickiness << Constants.StickinessOffset));
}
function getCollapseOnReplaceEdit(node) {
    return ((node.metadata & Constants.CollapseOnReplaceEditMask) >>> Constants.CollapseOnReplaceEditOffset) === 1;
}
function setCollapseOnReplaceEdit(node, value) {
    node.metadata = ((node.metadata & Constants.CollapseOnReplaceEditMaskInverse) | ((value ? 1 : 0) << Constants.CollapseOnReplaceEditOffset));
}
class IntervalNode {
    constructor(id, start, end) {
        this.metadata = 0;
        this.parent = this;
        this.left = this;
        this.right = this;
        setNodeColor(this, NodeColor.Red);
        this.start = start;
        this.end = end;
        this.delta = 0;
        this.maxEnd = end;
        this.id = id;
        this.ownerId = 0;
        this.options = null;
        setNodeIsForValidation(this, false);
        setNodeIsInGlyphMargin(this, false);
        _setNodeStickiness(this, TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges);
        setCollapseOnReplaceEdit(this, false);
        setNodeAffectsFont(this, false);
        this.cachedVersionId = 0;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = null;
        setNodeIsVisited(this, false);
    }
    reset(versionId, start, end, range) {
        this.start = start;
        this.end = end;
        this.maxEnd = end;
        this.cachedVersionId = versionId;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = range;
    }
    setOptions(options) {
        this.options = options;
        const className = this.options.className;
        setNodeIsForValidation(
            this,
            (className === ClassName.EditorErrorDecoration || className === ClassName.EditorWarningDecoration || className === ClassName.EditorInfoDecoration)
        );
        setNodeIsInGlyphMargin(this, this.options.glyphMarginClassName !== null);
        _setNodeStickiness(this, this.options.stickiness);
        setCollapseOnReplaceEdit(this, this.options.collapseOnReplaceEdit);
        setNodeAffectsFont(this, this.options.affectsFont ?? false);
    }
    setCachedOffsets(absoluteStart, absoluteEnd, cachedVersionId) {
        if (this.cachedVersionId !== cachedVersionId) {
            this.range = null;
        }
        this.cachedVersionId = cachedVersionId;
        this.cachedAbsoluteStart = absoluteStart;
        this.cachedAbsoluteEnd = absoluteEnd;
    }
    detach() {
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}
const SENTINEL = ( new IntervalNode(null, 0, 0));
SENTINEL.parent = SENTINEL;
SENTINEL.left = SENTINEL;
SENTINEL.right = SENTINEL;
setNodeColor(SENTINEL, NodeColor.Black);
class IntervalTree {
    constructor() {
        this.root = SENTINEL;
        this.requestNormalizeDelta = false;
    }
    intervalSearch(
        start,
        end,
        filterOwnerId,
        filterOutValidation,
        filterFontDecorations,
        cachedVersionId,
        onlyMarginDecorations
    ) {
        if (this.root === SENTINEL) {
            return [];
        }
        return intervalSearch(
            this,
            start,
            end,
            filterOwnerId,
            filterOutValidation,
            filterFontDecorations,
            cachedVersionId,
            onlyMarginDecorations
        );
    }
    search(
        filterOwnerId,
        filterOutValidation,
        filterFontDecorations,
        cachedVersionId,
        onlyMarginDecorations
    ) {
        if (this.root === SENTINEL) {
            return [];
        }
        return search(
            this,
            filterOwnerId,
            filterOutValidation,
            filterFontDecorations,
            cachedVersionId,
            onlyMarginDecorations
        );
    }
    collectNodesFromOwner(ownerId) {
        return collectNodesFromOwner(this, ownerId);
    }
    collectNodesPostOrder() {
        return collectNodesPostOrder(this);
    }
    insert(node) {
        rbTreeInsert(this, node);
        this._normalizeDeltaIfNecessary();
    }
    delete(node) {
        rbTreeDelete(this, node);
        this._normalizeDeltaIfNecessary();
    }
    resolveNode(node, cachedVersionId) {
        const initialNode = node;
        let delta = 0;
        while (node !== this.root) {
            if (node === node.parent.right) {
                delta += node.parent.delta;
            }
            node = node.parent;
        }
        const nodeStart = initialNode.start + delta;
        const nodeEnd = initialNode.end + delta;
        initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
    }
    acceptReplace(offset, length, textLength, forceMoveMarkers) {
        const nodesOfInterest = searchForEditing(this, offset, offset + length);
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            rbTreeDelete(this, node);
        }
        this._normalizeDeltaIfNecessary();
        noOverlapReplace(this, offset, offset + length, textLength);
        this._normalizeDeltaIfNecessary();
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            node.start = node.cachedAbsoluteStart;
            node.end = node.cachedAbsoluteEnd;
            nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
            node.maxEnd = node.end;
            rbTreeInsert(this, node);
        }
        this._normalizeDeltaIfNecessary();
    }
    getAllInOrder() {
        return search(this, 0, false, false, 0, false);
    }
    _normalizeDeltaIfNecessary() {
        if (!this.requestNormalizeDelta) {
            return;
        }
        this.requestNormalizeDelta = false;
        normalizeDelta(this);
    }
}
function normalizeDelta(T) {
    let node = T.root;
    let delta = 0;
    while (node !== SENTINEL) {
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
        node.start = delta + node.start;
        node.end = delta + node.end;
        node.delta = 0;
        recomputeMaxEnd(node);
        setNodeIsVisited(node, true);
        setNodeIsVisited(node.left, false);
        setNodeIsVisited(node.right, false);
        if (node === node.parent.right) {
            delta -= node.parent.delta;
        }
        node = node.parent;
    }
    setNodeIsVisited(T.root, false);
}
var MarkerMoveSemantics;
(function(MarkerMoveSemantics) {
    MarkerMoveSemantics[MarkerMoveSemantics["MarkerDefined"] = 0] = "MarkerDefined";
    MarkerMoveSemantics[MarkerMoveSemantics["ForceMove"] = 1] = "ForceMove";
    MarkerMoveSemantics[MarkerMoveSemantics["ForceStay"] = 2] = "ForceStay";
})(MarkerMoveSemantics || (MarkerMoveSemantics = {}));
function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
    if (markerOffset < checkOffset) {
        return true;
    }
    if (markerOffset > checkOffset) {
        return false;
    }
    if (moveSemantics === MarkerMoveSemantics.ForceMove) {
        return false;
    }
    if (moveSemantics === MarkerMoveSemantics.ForceStay) {
        return true;
    }
    return markerStickToPreviousCharacter;
}
function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
    const nodeStickiness = getNodeStickiness(node);
    const startStickToPreviousCharacter = (nodeStickiness === TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges || nodeStickiness === TrackedRangeStickiness.GrowsOnlyWhenTypingBefore);
    const endStickToPreviousCharacter = (nodeStickiness === TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges || nodeStickiness === TrackedRangeStickiness.GrowsOnlyWhenTypingBefore);
    const deletingCnt = (end - start);
    const insertingCnt = textLength;
    const commonLength = Math.min(deletingCnt, insertingCnt);
    const nodeStart = node.start;
    let startDone = false;
    const nodeEnd = node.end;
    let endDone = false;
    if (start <= nodeStart && nodeEnd <= end && getCollapseOnReplaceEdit(node)) {
        node.start = start;
        startDone = true;
        node.end = start;
        endDone = true;
    }
    {
        const moveSemantics = forceMoveMarkers ? MarkerMoveSemantics.ForceMove : (deletingCnt > 0 ? MarkerMoveSemantics.ForceStay : MarkerMoveSemantics.MarkerDefined);
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
            endDone = true;
        }
    }
    if (commonLength > 0 && !forceMoveMarkers) {
        const moveSemantics = (deletingCnt > insertingCnt ? MarkerMoveSemantics.ForceStay : MarkerMoveSemantics.MarkerDefined);
        if (!startDone && adjustMarkerBeforeColumn(
            nodeStart,
            startStickToPreviousCharacter,
            start + commonLength,
            moveSemantics
        )) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
            endDone = true;
        }
    }
    {
        const moveSemantics = forceMoveMarkers ? MarkerMoveSemantics.ForceMove : MarkerMoveSemantics.MarkerDefined;
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
            node.start = start + insertingCnt;
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
            node.end = start + insertingCnt;
            endDone = true;
        }
    }
    const deltaColumn = (insertingCnt - deletingCnt);
    if (!startDone) {
        node.start = Math.max(0, nodeStart + deltaColumn);
    }
    if (!endDone) {
        node.end = Math.max(0, nodeEnd + deltaColumn);
    }
    if (node.start > node.end) {
        node.end = node.start;
    }
}
function searchForEditing(T, start, end) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= start) {
            node.setCachedOffsets(nodeStart, nodeEnd, 0);
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function noOverlapReplace(T, start, end, textLength) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    const editDelta = (textLength - (end - start));
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            recomputeMaxEnd(node);
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            node.start += editDelta;
            node.end += editDelta;
            node.delta += editDelta;
            if (node.delta < Constants.MIN_SAFE_DELTA || node.delta > Constants.MAX_SAFE_DELTA) {
                T.requestNormalizeDelta = true;
            }
            setNodeIsVisited(node, true);
            continue;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
}
function collectNodesFromOwner(T, ownerId) {
    let node = T.root;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.ownerId === ownerId) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function collectNodesPostOrder(T) {
    let node = T.root;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            node = node.right;
            continue;
        }
        result[resultLen++] = node;
        setNodeIsVisited(node, true);
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function search(
    T,
    filterOwnerId,
    filterOutValidation,
    filterFontDecorations,
    cachedVersionId,
    onlyMarginDecorations
) {
    let node = T.root;
    let delta = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        nodeStart = delta + node.start;
        nodeEnd = delta + node.end;
        node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        let include = true;
        if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
            include = false;
        }
        if (filterOutValidation && getNodeIsForValidation(node)) {
            include = false;
        }
        if (filterFontDecorations && getNodeAffectsFont(node)) {
            include = false;
        }
        if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
            include = false;
        }
        if (include) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function intervalSearch(
    T,
    intervalStart,
    intervalEnd,
    filterOwnerId,
    filterOutValidation,
    filterFontDecorations,
    cachedVersionId,
    onlyMarginDecorations
) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < intervalStart) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > intervalEnd) {
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= intervalStart) {
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            let include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (filterFontDecorations && getNodeAffectsFont(node)) {
                include = false;
            }
            if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function rbTreeInsert(T, newNode) {
    if (T.root === SENTINEL) {
        newNode.parent = SENTINEL;
        newNode.left = SENTINEL;
        newNode.right = SENTINEL;
        setNodeColor(newNode, NodeColor.Black);
        T.root = newNode;
        return T.root;
    }
    treeInsert(T, newNode);
    recomputeMaxEndWalkToRoot(newNode.parent);
    let x = newNode;
    while (x !== T.root && getNodeColor(x.parent) === NodeColor.Red) {
        if (x.parent === x.parent.parent.left) {
            const y = x.parent.parent.right;
            if (getNodeColor(y) === NodeColor.Red) {
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(y, NodeColor.Black);
                setNodeColor(x.parent.parent, NodeColor.Red);
                x = x.parent.parent;
            } else {
                if (x === x.parent.right) {
                    x = x.parent;
                    leftRotate(T, x);
                }
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(x.parent.parent, NodeColor.Red);
                rightRotate(T, x.parent.parent);
            }
        } else {
            const y = x.parent.parent.left;
            if (getNodeColor(y) === NodeColor.Red) {
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(y, NodeColor.Black);
                setNodeColor(x.parent.parent, NodeColor.Red);
                x = x.parent.parent;
            } else {
                if (x === x.parent.left) {
                    x = x.parent;
                    rightRotate(T, x);
                }
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(x.parent.parent, NodeColor.Red);
                leftRotate(T, x.parent.parent);
            }
        }
    }
    setNodeColor(T.root, NodeColor.Black);
    return newNode;
}
function treeInsert(T, z) {
    let delta = 0;
    let x = T.root;
    const zAbsoluteStart = z.start;
    const zAbsoluteEnd = z.end;
    while (true) {
        const cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
        if (cmp < 0) {
            if (x.left === SENTINEL) {
                z.start -= delta;
                z.end -= delta;
                z.maxEnd -= delta;
                x.left = z;
                break;
            } else {
                x = x.left;
            }
        } else {
            if (x.right === SENTINEL) {
                z.start -= (delta + x.delta);
                z.end -= (delta + x.delta);
                z.maxEnd -= (delta + x.delta);
                x.right = z;
                break;
            } else {
                delta += x.delta;
                x = x.right;
            }
        }
    }
    z.parent = x;
    z.left = SENTINEL;
    z.right = SENTINEL;
    setNodeColor(z, NodeColor.Red);
}
function rbTreeDelete(T, z) {
    let x;
    let y;
    if (z.left === SENTINEL) {
        x = z.right;
        y = z;
        x.delta += z.delta;
        if (x.delta < Constants.MIN_SAFE_DELTA || x.delta > Constants.MAX_SAFE_DELTA) {
            T.requestNormalizeDelta = true;
        }
        x.start += z.delta;
        x.end += z.delta;
    } else if (z.right === SENTINEL) {
        x = z.left;
        y = z;
    } else {
        y = leftest(z.right);
        x = y.right;
        x.start += y.delta;
        x.end += y.delta;
        x.delta += y.delta;
        if (x.delta < Constants.MIN_SAFE_DELTA || x.delta > Constants.MAX_SAFE_DELTA) {
            T.requestNormalizeDelta = true;
        }
        y.start += z.delta;
        y.end += z.delta;
        y.delta = z.delta;
        if (y.delta < Constants.MIN_SAFE_DELTA || y.delta > Constants.MAX_SAFE_DELTA) {
            T.requestNormalizeDelta = true;
        }
    }
    if (y === T.root) {
        T.root = x;
        setNodeColor(x, NodeColor.Black);
        z.detach();
        resetSentinel();
        recomputeMaxEnd(x);
        T.root.parent = SENTINEL;
        return;
    }
    const yWasRed = (getNodeColor(y) === NodeColor.Red);
    if (y === y.parent.left) {
        y.parent.left = x;
    } else {
        y.parent.right = x;
    }
    if (y === z) {
        x.parent = y.parent;
    } else {
        if (y.parent === z) {
            x.parent = y;
        } else {
            x.parent = y.parent;
        }
        y.left = z.left;
        y.right = z.right;
        y.parent = z.parent;
        setNodeColor(y, getNodeColor(z));
        if (z === T.root) {
            T.root = y;
        } else {
            if (z === z.parent.left) {
                z.parent.left = y;
            } else {
                z.parent.right = y;
            }
        }
        if (y.left !== SENTINEL) {
            y.left.parent = y;
        }
        if (y.right !== SENTINEL) {
            y.right.parent = y;
        }
    }
    z.detach();
    if (yWasRed) {
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        resetSentinel();
        return;
    }
    recomputeMaxEndWalkToRoot(x);
    recomputeMaxEndWalkToRoot(x.parent);
    if (y !== z) {
        recomputeMaxEndWalkToRoot(y);
        recomputeMaxEndWalkToRoot(y.parent);
    }
    let w;
    while (x !== T.root && getNodeColor(x) === NodeColor.Black) {
        if (x === x.parent.left) {
            w = x.parent.right;
            if (getNodeColor(w) === NodeColor.Red) {
                setNodeColor(w, NodeColor.Black);
                setNodeColor(x.parent, NodeColor.Red);
                leftRotate(T, x.parent);
                w = x.parent.right;
            }
            if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
                setNodeColor(w, NodeColor.Red);
                x = x.parent;
            } else {
                if (getNodeColor(w.right) === NodeColor.Black) {
                    setNodeColor(w.left, NodeColor.Black);
                    setNodeColor(w, NodeColor.Red);
                    rightRotate(T, w);
                    w = x.parent.right;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(w.right, NodeColor.Black);
                leftRotate(T, x.parent);
                x = T.root;
            }
        } else {
            w = x.parent.left;
            if (getNodeColor(w) === NodeColor.Red) {
                setNodeColor(w, NodeColor.Black);
                setNodeColor(x.parent, NodeColor.Red);
                rightRotate(T, x.parent);
                w = x.parent.left;
            }
            if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
                setNodeColor(w, NodeColor.Red);
                x = x.parent;
            } else {
                if (getNodeColor(w.left) === NodeColor.Black) {
                    setNodeColor(w.right, NodeColor.Black);
                    setNodeColor(w, NodeColor.Red);
                    leftRotate(T, w);
                    w = x.parent.left;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, NodeColor.Black);
                setNodeColor(w.left, NodeColor.Black);
                rightRotate(T, x.parent);
                x = T.root;
            }
        }
    }
    setNodeColor(x, NodeColor.Black);
    resetSentinel();
}
function leftest(node) {
    while (node.left !== SENTINEL) {
        node = node.left;
    }
    return node;
}
function resetSentinel() {
    SENTINEL.parent = SENTINEL;
    SENTINEL.delta = 0;
    SENTINEL.start = 0;
    SENTINEL.end = 0;
}
function leftRotate(T, x) {
    const y = x.right;
    y.delta += x.delta;
    if (y.delta < Constants.MIN_SAFE_DELTA || y.delta > Constants.MAX_SAFE_DELTA) {
        T.requestNormalizeDelta = true;
    }
    y.start += x.delta;
    y.end += x.delta;
    x.right = y.left;
    if (y.left !== SENTINEL) {
        y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === SENTINEL) {
        T.root = y;
    } else if (x === x.parent.left) {
        x.parent.left = y;
    } else {
        x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
    recomputeMaxEnd(x);
    recomputeMaxEnd(y);
}
function rightRotate(T, y) {
    const x = y.left;
    y.delta -= x.delta;
    if (y.delta < Constants.MIN_SAFE_DELTA || y.delta > Constants.MAX_SAFE_DELTA) {
        T.requestNormalizeDelta = true;
    }
    y.start -= x.delta;
    y.end -= x.delta;
    y.left = x.right;
    if (x.right !== SENTINEL) {
        x.right.parent = y;
    }
    x.parent = y.parent;
    if (y.parent === SENTINEL) {
        T.root = x;
    } else if (y === y.parent.right) {
        y.parent.right = x;
    } else {
        y.parent.left = x;
    }
    x.right = y;
    y.parent = x;
    recomputeMaxEnd(y);
    recomputeMaxEnd(x);
}
function computeMaxEnd(node) {
    let maxEnd = node.end;
    if (node.left !== SENTINEL) {
        const leftMaxEnd = node.left.maxEnd;
        if (leftMaxEnd > maxEnd) {
            maxEnd = leftMaxEnd;
        }
    }
    if (node.right !== SENTINEL) {
        const rightMaxEnd = node.right.maxEnd + node.delta;
        if (rightMaxEnd > maxEnd) {
            maxEnd = rightMaxEnd;
        }
    }
    return maxEnd;
}
function recomputeMaxEnd(node) {
    node.maxEnd = computeMaxEnd(node);
}
function recomputeMaxEndWalkToRoot(node) {
    while (node !== SENTINEL) {
        const maxEnd = computeMaxEnd(node);
        if (node.maxEnd === maxEnd) {
            return;
        }
        node.maxEnd = maxEnd;
        node = node.parent;
    }
}
function intervalCompare(aStart, aEnd, bStart, bEnd) {
    if (aStart === bStart) {
        return aEnd - bEnd;
    }
    return aStart - bStart;
}

export { ClassName, IntervalNode, IntervalTree, NodeColor, SENTINEL, getNodeColor, intervalCompare, nodeAcceptEdit, recomputeMaxEnd };
