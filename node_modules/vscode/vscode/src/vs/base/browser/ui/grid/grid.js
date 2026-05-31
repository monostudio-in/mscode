
import { registerCss } from '../../../../../../../css.js';
import { Orientation } from '../sash/sash.js';
import { tail, equals } from '../../../common/arrays.js';
import { Disposable } from '../../../common/lifecycle.js';
import * as gridview from './gridview.css';
import { orthogonal, GridView } from './gridview.js';
import { Sizing as Sizing$1 } from '../splitview/splitview.js';
export { LayoutPriority } from '../splitview/splitview.js';

registerCss(gridview);
var Direction;
(function(Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
function oppositeDirection(direction) {
    switch (direction) {
    case Direction.Up:
        return Direction.Down;
    case Direction.Down:
        return Direction.Up;
    case Direction.Left:
        return Direction.Right;
    case Direction.Right:
        return Direction.Left;
    }
}
function isGridBranchNode(node) {
    return !!node.children;
}
function getGridNode(node, location) {
    if (location.length === 0) {
        return node;
    }
    if (!isGridBranchNode(node)) {
        throw ( new Error("Invalid location"));
    }
    const [index, ...rest] = location;
    return getGridNode(node.children[index], rest);
}
function intersects(one, other) {
    return !(one.start >= other.end || other.start >= one.end);
}
function getBoxBoundary(box, direction) {
    const orientation = getDirectionOrientation(direction);
    const offset = direction === Direction.Up ? box.top : direction === Direction.Right ? box.left + box.width : direction === Direction.Down ? box.top + box.height : box.left;
    const range = {
        start: orientation === Orientation.HORIZONTAL ? box.top : box.left,
        end: orientation === Orientation.HORIZONTAL ? box.top + box.height : box.left + box.width
    };
    return {
        offset,
        range
    };
}
function findAdjacentBoxLeafNodes(boxNode, direction, boundary) {
    const result = [];
    function _(boxNode, direction, boundary) {
        if (isGridBranchNode(boxNode)) {
            for (const child of boxNode.children) {
                _(child, direction, boundary);
            }
        } else {
            const {
                offset,
                range
            } = getBoxBoundary(boxNode.box, direction);
            if (offset === boundary.offset && intersects(range, boundary.range)) {
                result.push(boxNode);
            }
        }
    }
    _(boxNode, direction, boundary);
    return result;
}
function getLocationOrientation(rootOrientation, location) {
    return location.length % 2 === 0 ? orthogonal(rootOrientation) : rootOrientation;
}
function getDirectionOrientation(direction) {
    return direction === Direction.Up || direction === Direction.Down ? Orientation.VERTICAL : Orientation.HORIZONTAL;
}
function getRelativeLocation(rootOrientation, location, direction) {
    const orientation = getLocationOrientation(rootOrientation, location);
    const directionOrientation = getDirectionOrientation(direction);
    if (orientation === directionOrientation) {
        let [rest, index] = tail(location);
        if (direction === Direction.Right || direction === Direction.Down) {
            index += 1;
        }
        return [...rest, index];
    } else {
        const index = (direction === Direction.Right || direction === Direction.Down) ? 1 : 0;
        return [...location, index];
    }
}
function indexInParent(element) {
    const parentElement = element.parentElement;
    if (!parentElement) {
        throw ( new Error("Invalid grid element"));
    }
    let el = parentElement.firstElementChild;
    let index = 0;
    while (el !== element && el !== parentElement.lastElementChild && el) {
        el = el.nextElementSibling;
        index++;
    }
    return index;
}
function getGridLocation(element) {
    const parentElement = element.parentElement;
    if (!parentElement) {
        throw ( new Error("Invalid grid element"));
    }
    if (/\bmonaco-grid-view\b/.test(parentElement.className)) {
        return [];
    }
    const index = indexInParent(parentElement);
    const ancestor = parentElement.parentElement.parentElement.parentElement.parentElement;
    return [...getGridLocation(ancestor), index];
}
var Sizing;
(function(Sizing) {
    Sizing.Distribute = {
        type: "distribute"
    };
    Sizing.Split = {
        type: "split"
    };
    Sizing.Auto = {
        type: "auto"
    };
    function Invisible(cachedVisibleSize) {
        return {
            type: "invisible",
            cachedVisibleSize
        };
    }
    Sizing.Invisible = Invisible;
})(Sizing || (Sizing = {}));
class Grid extends Disposable {
    get orientation() {
        return this.gridview.orientation;
    }
    set orientation(orientation) {
        this.gridview.orientation = orientation;
    }
    get width() {
        return this.gridview.width;
    }
    get height() {
        return this.gridview.height;
    }
    get minimumWidth() {
        return this.gridview.minimumWidth;
    }
    get minimumHeight() {
        return this.gridview.minimumHeight;
    }
    get maximumWidth() {
        return this.gridview.maximumWidth;
    }
    get maximumHeight() {
        return this.gridview.maximumHeight;
    }
    get boundarySashes() {
        return this.gridview.boundarySashes;
    }
    set boundarySashes(boundarySashes) {
        this.gridview.boundarySashes = boundarySashes;
    }
    set edgeSnapping(edgeSnapping) {
        this.gridview.edgeSnapping = edgeSnapping;
    }
    get element() {
        return this.gridview.element;
    }
    constructor(view, options = {}) {
        super();
        this.views = ( new Map());
        this.didLayout = false;
        if (view instanceof GridView) {
            this.gridview = view;
            this.gridview.getViewMap(this.views);
        } else {
            this.gridview = ( new GridView(options));
        }
        this._register(this.gridview);
        this._register(this.gridview.onDidSashReset(this.onDidSashReset, this));
        if (!(view instanceof GridView)) {
            this._addView(view, 0, [0]);
        }
        this.onDidChange = this.gridview.onDidChange;
        this.onDidScroll = this.gridview.onDidScroll;
        this.onDidChangeViewMaximized = this.gridview.onDidChangeViewMaximized;
    }
    style(styles) {
        this.gridview.style(styles);
    }
    layout(width, height, top = 0, left = 0) {
        this.gridview.layout(width, height, top, left);
        this.didLayout = true;
    }
    addView(newView, size, referenceView, direction) {
        if (( this.views.has(newView))) {
            throw ( new Error("Can't add same view twice"));
        }
        const orientation = getDirectionOrientation(direction);
        if (this.views.size === 1 && this.orientation !== orientation) {
            this.orientation = orientation;
        }
        const referenceLocation = this.getViewLocation(referenceView);
        const location = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
        let viewSize;
        if (typeof size === "number") {
            viewSize = size;
        } else if (size.type === "split") {
            const [, index] = tail(referenceLocation);
            viewSize = Sizing$1.Split(index);
        } else if (size.type === "distribute") {
            viewSize = Sizing$1.Distribute;
        } else if (size.type === "auto") {
            const [, index] = tail(referenceLocation);
            viewSize = Sizing$1.Auto(index);
        } else {
            viewSize = size;
        }
        this._addView(newView, viewSize, location);
    }
    addViewAt(newView, size, location) {
        if (( this.views.has(newView))) {
            throw ( new Error("Can't add same view twice"));
        }
        let viewSize;
        if (typeof size === "number") {
            viewSize = size;
        } else if (size.type === "distribute") {
            viewSize = Sizing$1.Distribute;
        } else {
            viewSize = size;
        }
        this._addView(newView, viewSize, location);
    }
    _addView(newView, size, location) {
        this.views.set(newView, newView.element);
        this.gridview.addView(newView, size, location);
    }
    removeView(view, sizing) {
        if (this.views.size === 1) {
            throw ( new Error("Can't remove last view"));
        }
        const location = this.getViewLocation(view);
        let gridViewSizing;
        if (sizing?.type === "distribute") {
            gridViewSizing = Sizing$1.Distribute;
        } else if (sizing?.type === "auto") {
            const index = location[location.length - 1];
            gridViewSizing = Sizing$1.Auto(index === 0 ? 1 : index - 1);
        }
        this.gridview.removeView(location, gridViewSizing);
        this.views.delete(view);
    }
    moveView(view, sizing, referenceView, direction) {
        const sourceLocation = this.getViewLocation(view);
        const [sourceParentLocation, from] = tail(sourceLocation);
        const referenceLocation = this.getViewLocation(referenceView);
        const targetLocation = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
        const [targetParentLocation, to] = tail(targetLocation);
        if (equals(sourceParentLocation, targetParentLocation)) {
            this.gridview.moveView(sourceParentLocation, from, to);
        } else {
            this.removeView(view, typeof sizing === "number" ? undefined : sizing);
            this.addView(view, sizing, referenceView, direction);
        }
    }
    moveViewTo(view, location) {
        const sourceLocation = this.getViewLocation(view);
        const [sourceParentLocation, from] = tail(sourceLocation);
        const [targetParentLocation, to] = tail(location);
        if (equals(sourceParentLocation, targetParentLocation)) {
            this.gridview.moveView(sourceParentLocation, from, to);
        } else {
            const size = this.getViewSize(view);
            const orientation = getLocationOrientation(this.gridview.orientation, sourceLocation);
            const cachedViewSize = this.getViewCachedVisibleSize(view);
            const sizing = typeof cachedViewSize === "undefined" ? (orientation === Orientation.HORIZONTAL ? size.width : size.height) : Sizing.Invisible(cachedViewSize);
            this.removeView(view);
            this.addViewAt(view, sizing, location);
        }
    }
    swapViews(from, to) {
        const fromLocation = this.getViewLocation(from);
        const toLocation = this.getViewLocation(to);
        return this.gridview.swapViews(fromLocation, toLocation);
    }
    resizeView(view, size) {
        const location = this.getViewLocation(view);
        return this.gridview.resizeView(location, size);
    }
    isViewExpanded(view) {
        const location = this.getViewLocation(view);
        return this.gridview.isViewExpanded(location);
    }
    isViewMaximized(view) {
        const location = this.getViewLocation(view);
        return this.gridview.isViewMaximized(location);
    }
    hasMaximizedView() {
        return this.gridview.hasMaximizedView();
    }
    getViewSize(view) {
        if (!view) {
            return this.gridview.getViewSize();
        }
        const location = this.getViewLocation(view);
        return this.gridview.getViewSize(location);
    }
    getViewCachedVisibleSize(view) {
        const location = this.getViewLocation(view);
        return this.gridview.getViewCachedVisibleSize(location);
    }
    maximizeView(view, excludeViews = []) {
        if (this.views.size < 2) {
            throw ( new Error("At least two views are required to maximize a view"));
        }
        const location = this.getViewLocation(view);
        this.gridview.maximizeView(location, excludeViews);
    }
    exitMaximizedView() {
        this.gridview.exitMaximizedView();
    }
    expandView(view) {
        const location = this.getViewLocation(view);
        this.gridview.expandView(location);
    }
    distributeViewSizes() {
        this.gridview.distributeViewSizes();
    }
    isViewVisible(view) {
        const location = this.getViewLocation(view);
        return this.gridview.isViewVisible(location);
    }
    setViewVisible(view, visible) {
        const location = this.getViewLocation(view);
        this.gridview.setViewVisible(location, visible);
    }
    getViews() {
        return this.gridview.getView();
    }
    getNeighborViews(view, direction, wrap = false) {
        if (!this.didLayout) {
            throw ( new Error("Can't call getNeighborViews before first layout"));
        }
        const location = this.getViewLocation(view);
        const root = this.getViews();
        const node = getGridNode(root, location);
        let boundary = getBoxBoundary(node.box, direction);
        if (wrap) {
            if (direction === Direction.Up && node.box.top === 0) {
                boundary = {
                    offset: root.box.top + root.box.height,
                    range: boundary.range
                };
            } else if (direction === Direction.Right && node.box.left + node.box.width === root.box.width) {
                boundary = {
                    offset: 0,
                    range: boundary.range
                };
            } else if (direction === Direction.Down && node.box.top + node.box.height === root.box.height) {
                boundary = {
                    offset: 0,
                    range: boundary.range
                };
            } else if (direction === Direction.Left && node.box.left === 0) {
                boundary = {
                    offset: root.box.left + root.box.width,
                    range: boundary.range
                };
            }
        }
        return ( findAdjacentBoxLeafNodes(root, oppositeDirection(direction), boundary).map(node => node.view));
    }
    getViewLocation(view) {
        const element = this.views.get(view);
        if (!element) {
            throw ( new Error("View not found"));
        }
        return getGridLocation(element);
    }
    onDidSashReset(location) {
        const resizeToPreferredSize = location => {
            const node = this.gridview.getView(location);
            if (isGridBranchNode(node)) {
                return false;
            }
            const direction = getLocationOrientation(this.orientation, location);
            const size = direction === Orientation.HORIZONTAL ? node.view.preferredWidth : node.view.preferredHeight;
            if (typeof size !== "number") {
                return false;
            }
            const viewSize = direction === Orientation.HORIZONTAL ? {
                width: Math.round(size)
            } : {
                height: Math.round(size)
            };
            this.gridview.resizeView(location, viewSize);
            return true;
        };
        if (resizeToPreferredSize(location)) {
            return;
        }
        const [parentLocation, index] = tail(location);
        if (resizeToPreferredSize([...parentLocation, index + 1])) {
            return;
        }
        this.gridview.distributeViewSizes(parentLocation);
    }
}
class SerializableGrid extends Grid {
    constructor() {
        super(...arguments);
        this.initialLayoutContext = true;
    }
    static serializeNode(node, orientation) {
        const size = orientation === Orientation.VERTICAL ? node.box.width : node.box.height;
        if (!isGridBranchNode(node)) {
            const serializedLeafNode = {
                type: "leaf",
                data: node.view.toJSON(),
                size
            };
            if (typeof node.cachedVisibleSize === "number") {
                serializedLeafNode.size = node.cachedVisibleSize;
                serializedLeafNode.visible = false;
            } else if (node.maximized) {
                serializedLeafNode.maximized = true;
            }
            return serializedLeafNode;
        }
        const data = ( node.children.map(c => SerializableGrid.serializeNode(c, orthogonal(orientation))));
        if (( data.some(c => c.visible !== false))) {
            return {
                type: "branch",
                data: data,
                size
            };
        }
        return {
            type: "branch",
            data: data,
            size,
            visible: false
        };
    }
    static deserialize(json, deserializer, options = {}) {
        if (typeof json.orientation !== "number") {
            throw ( new Error("Invalid JSON: 'orientation' property must be a number."));
        } else if (typeof json.width !== "number") {
            throw ( new Error("Invalid JSON: 'width' property must be a number."));
        } else if (typeof json.height !== "number") {
            throw ( new Error("Invalid JSON: 'height' property must be a number."));
        }
        const gridview = GridView.deserialize(json, deserializer, options);
        const result = ( new SerializableGrid(gridview, options));
        return result;
    }
    static from(gridDescriptor, options = {}) {
        return SerializableGrid.deserialize(createSerializedGrid(gridDescriptor), {
            fromJSON: view => view
        }, options);
    }
    serialize() {
        return {
            root: SerializableGrid.serializeNode(this.getViews(), this.orientation),
            orientation: this.orientation,
            width: this.width,
            height: this.height
        };
    }
    layout(width, height, top = 0, left = 0) {
        super.layout(width, height, top, left);
        if (this.initialLayoutContext) {
            this.initialLayoutContext = false;
            this.gridview.trySet2x2();
        }
    }
}
function isGridBranchNodeDescriptor(nodeDescriptor) {
    return !!nodeDescriptor.groups;
}
function sanitizeGridNodeDescriptor(nodeDescriptor, rootNode) {
    if (!rootNode && nodeDescriptor.groups && nodeDescriptor.groups.length <= 1) {
        nodeDescriptor.groups = undefined;
    }
    if (!isGridBranchNodeDescriptor(nodeDescriptor)) {
        return;
    }
    let totalDefinedSize = 0;
    let totalDefinedSizeCount = 0;
    for (const child of nodeDescriptor.groups) {
        sanitizeGridNodeDescriptor(child, false);
        if (child.size) {
            totalDefinedSize += child.size;
            totalDefinedSizeCount++;
        }
    }
    const totalUndefinedSize = totalDefinedSizeCount > 0 ? totalDefinedSize : 1;
    const totalUndefinedSizeCount = nodeDescriptor.groups.length - totalDefinedSizeCount;
    const eachUndefinedSize = totalUndefinedSize / totalUndefinedSizeCount;
    for (const child of nodeDescriptor.groups) {
        if (!child.size) {
            child.size = eachUndefinedSize;
        }
    }
}
function createSerializedNode(nodeDescriptor) {
    if (isGridBranchNodeDescriptor(nodeDescriptor)) {
        return {
            type: "branch",
            data: ( nodeDescriptor.groups.map(c => createSerializedNode(c))),
            size: nodeDescriptor.size
        };
    } else {
        return {
            type: "leaf",
            data: nodeDescriptor.data,
            size: nodeDescriptor.size
        };
    }
}
function getDimensions(node, orientation) {
    if (node.type === "branch") {
        const childrenDimensions = ( node.data.map(c => getDimensions(c, orthogonal(orientation))));
        if (orientation === Orientation.VERTICAL) {
            const width = node.size || (childrenDimensions.length === 0 ? undefined : Math.max(...( childrenDimensions.map(d => d.width || 0))));
            const height = childrenDimensions.length === 0 ? undefined : childrenDimensions.reduce((r, d) => r + (d.height || 0), 0);
            return {
                width,
                height
            };
        } else {
            const width = childrenDimensions.length === 0 ? undefined : childrenDimensions.reduce((r, d) => r + (d.width || 0), 0);
            const height = node.size || (childrenDimensions.length === 0 ? undefined : Math.max(...( childrenDimensions.map(d => d.height || 0))));
            return {
                width,
                height
            };
        }
    } else {
        const width = orientation === Orientation.VERTICAL ? node.size : undefined;
        const height = orientation === Orientation.VERTICAL ? undefined : node.size;
        return {
            width,
            height
        };
    }
}
function createSerializedGrid(gridDescriptor) {
    sanitizeGridNodeDescriptor(gridDescriptor, true);
    const root = createSerializedNode(gridDescriptor);
    const {
        width,
        height
    } = getDimensions(root, gridDescriptor.orientation);
    return {
        root,
        orientation: gridDescriptor.orientation,
        width: width || 1,
        height: height || 1
    };
}

export { Direction, Grid, Orientation, SerializableGrid, Sizing, createSerializedGrid, getRelativeLocation, isGridBranchNode, orthogonal, sanitizeGridNodeDescriptor };
