
import { __decorate } from '../../../../../external/tslib/tslib.es6.js';
import { memoize } from './decorators.js';
import { PathIterator } from './ternarySearchTree.js';
import { posix } from './path.js';
import { extUri } from './resources.js';
import { URI } from './uri.js';

class Node {
    get childrenCount() {
        return this._children.size;
    }
    get children() {
        return ( this._children.values());
    }
    get name() {
        return posix.basename(this.relativePath);
    }
    constructor(uri, relativePath, context, element = undefined, parent = undefined) {
        this.uri = uri;
        this.relativePath = relativePath;
        this.context = context;
        this.element = element;
        this.parent = parent;
        this._children = ( new Map());
    }
    get(path) {
        return this._children.get(path);
    }
    set(path, child) {
        this._children.set(path, child);
    }
    delete(path) {
        this._children.delete(path);
    }
    clear() {
        this._children.clear();
    }
}
Node.__decorator = ( __decorate([memoize], Node.prototype, "name", null));
function collect(node, result) {
    if (typeof node.element !== "undefined") {
        result.push(node.element);
    }
    for (const child of node.children) {
        collect(child, result);
    }
    return result;
}
class ResourceTree {
    static getRoot(node) {
        while (node.parent) {
            node = node.parent;
        }
        return node;
    }
    static collect(node) {
        return collect(node, []);
    }
    static isResourceNode(obj) {
        return obj instanceof Node;
    }
    constructor(context, rootURI = URI.file("/"), extUri$1 = extUri) {
        this.extUri = extUri$1;
        this.root = ( new Node(rootURI, "", context));
    }
    add(uri, element) {
        const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
        const iterator = ( new PathIterator(false)).reset(key);
        let node = this.root;
        let path = "";
        while (true) {
            const name = iterator.value();
            path = path + "/" + name;
            let child = node.get(name);
            if (!child) {
                child = ( new Node(
                    this.extUri.joinPath(this.root.uri, path),
                    path,
                    this.root.context,
                    iterator.hasNext() ? undefined : element,
                    node
                ));
                node.set(name, child);
            } else if (!iterator.hasNext()) {
                child.element = element;
            }
            node = child;
            if (!iterator.hasNext()) {
                return;
            }
            iterator.next();
        }
    }
    delete(uri) {
        const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
        const iterator = ( new PathIterator(false)).reset(key);
        return this._delete(this.root, iterator);
    }
    _delete(node, iterator) {
        const name = iterator.value();
        const child = node.get(name);
        if (!child) {
            return undefined;
        }
        if (iterator.hasNext()) {
            const result = this._delete(child, iterator.next());
            if (typeof result !== "undefined" && child.childrenCount === 0) {
                node.delete(name);
            }
            return result;
        }
        node.delete(name);
        return child.element;
    }
    clear() {
        this.root.clear();
    }
    getNode(uri) {
        const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
        const iterator = ( new PathIterator(false)).reset(key);
        let node = this.root;
        while (true) {
            const name = iterator.value();
            const child = node.get(name);
            if (!child || !iterator.hasNext()) {
                return child;
            }
            node = child;
            iterator.next();
        }
    }
}

export { ResourceTree };
