

var TestIdPathParts;
(function(TestIdPathParts) {
    TestIdPathParts["Delimiter"] = "\u0000";
})(TestIdPathParts || (TestIdPathParts = {}));
var TestPosition;
(function(TestPosition) {
    TestPosition[TestPosition["IsSame"] = 0] = "IsSame";
    TestPosition[TestPosition["Disconnected"] = 1] = "Disconnected";
    TestPosition[TestPosition["IsChild"] = 2] = "IsChild";
    TestPosition[TestPosition["IsParent"] = 3] = "IsParent";
})(TestPosition || (TestPosition = {}));
class TestId {
    static fromExtHostTestItem(item, rootId, parent = item.parent) {
        if (item._isRoot) {
            return ( new TestId([rootId]));
        }
        const path = [item.id];
        for (let i = parent; i && i.id !== rootId; i = i.parent) {
            path.push(i.id);
        }
        path.push(rootId);
        return ( new TestId(path.reverse()));
    }
    static isRoot(idString) {
        return !idString.includes(TestIdPathParts.Delimiter);
    }
    static root(idString) {
        const idx = idString.indexOf(TestIdPathParts.Delimiter);
        return idx === -1 ? idString : idString.slice(0, idx);
    }
    static fromString(idString) {
        return ( new TestId(idString.split(TestIdPathParts.Delimiter)));
    }
    static join(base, b) {
        return ( new TestId([...base.path, b]));
    }
    static split(idString) {
        return idString.split(TestIdPathParts.Delimiter);
    }
    static joinToString(base, b) {
        return ( base.toString()) + TestIdPathParts.Delimiter + b;
    }
    static parentId(idString) {
        const idx = idString.lastIndexOf(TestIdPathParts.Delimiter);
        return idx === -1 ? undefined : idString.slice(0, idx);
    }
    static localId(idString) {
        const idx = idString.lastIndexOf(TestIdPathParts.Delimiter);
        return idx === -1 ? idString : idString.slice(idx + TestIdPathParts.Delimiter.length);
    }
    static isChild(maybeParent, maybeChild) {
        return maybeChild[maybeParent.length] === TestIdPathParts.Delimiter && maybeChild.startsWith(maybeParent);
    }
    static compare(a, b) {
        if (a === b) {
            return TestPosition.IsSame;
        }
        if (TestId.isChild(a, b)) {
            return TestPosition.IsChild;
        }
        if (TestId.isChild(b, a)) {
            return TestPosition.IsParent;
        }
        return TestPosition.Disconnected;
    }
    static getLengthOfCommonPrefix(length, getId) {
        if (length === 0) {
            return 0;
        }
        let commonPrefix = 0;
        while (commonPrefix < length - 1) {
            for (let i = 1; i < length; i++) {
                const a = getId(i - 1);
                const b = getId(i);
                if (a.path[commonPrefix] !== b.path[commonPrefix]) {
                    return commonPrefix;
                }
            }
            commonPrefix++;
        }
        return commonPrefix;
    }
    constructor(path, viewEnd = path.length) {
        this.path = path;
        this.viewEnd = viewEnd;
        if (path.length === 0 || viewEnd < 1) {
            throw ( new Error("cannot create test with empty path"));
        }
    }
    get rootId() {
        return ( new TestId(this.path, 1));
    }
    get parentId() {
        return this.viewEnd > 1 ? ( new TestId(this.path, this.viewEnd - 1)) : undefined;
    }
    get localId() {
        return this.path[this.viewEnd - 1];
    }
    get controllerId() {
        return this.path[0];
    }
    get isRoot() {
        return this.viewEnd === 1;
    }
    *idsFromRoot() {
        for (let i = 1; i <= this.viewEnd; i++) {
            yield ( new TestId(this.path, i));
        }
    }
    *idsToRoot() {
        for (let i = this.viewEnd; i > 0; i--) {
            yield ( new TestId(this.path, i));
        }
    }
    compare(other) {
        if (typeof other === "string") {
            return TestId.compare(( this.toString()), other);
        }
        for (let i = 0; i < other.viewEnd && i < this.viewEnd; i++) {
            if (other.path[i] !== this.path[i]) {
                return TestPosition.Disconnected;
            }
        }
        if (other.viewEnd > this.viewEnd) {
            return TestPosition.IsChild;
        }
        if (other.viewEnd < this.viewEnd) {
            return TestPosition.IsParent;
        }
        return TestPosition.IsSame;
    }
    toJSON() {
        return ( this.toString());
    }
    toString() {
        if (!this.stringifed) {
            this.stringifed = this.path[0];
            for (let i = 1; i < this.viewEnd; i++) {
                this.stringifed += TestIdPathParts.Delimiter;
                this.stringifed += this.path[i];
            }
        }
        return this.stringifed;
    }
}

export { TestId, TestIdPathParts, TestPosition };
