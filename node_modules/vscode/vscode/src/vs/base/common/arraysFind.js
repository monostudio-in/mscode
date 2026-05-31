

function findLast(array, predicate, fromIndex = array.length - 1) {
    const idx = findLastIdx(array, predicate, fromIndex);
    if (idx === -1) {
        return undefined;
    }
    return array[idx];
}
function findLastIdx(array, predicate, fromIndex = array.length - 1) {
    for (let i = fromIndex; i >= 0; i--) {
        const element = array[i];
        if (predicate(element, i)) {
            return i;
        }
    }
    return -1;
}
function findFirst(array, predicate, fromIndex = 0) {
    const idx = findFirstIdx(array, predicate, fromIndex);
    if (idx === -1) {
        return undefined;
    }
    return array[idx];
}
function findFirstIdx(array, predicate, fromIndex = 0) {
    for (let i = fromIndex; i < array.length; i++) {
        const element = array[i];
        if (predicate(element, i)) {
            return i;
        }
    }
    return -1;
}
function findLastMonotonous(array, predicate) {
    const idx = findLastIdxMonotonous(array, predicate);
    return idx === -1 ? undefined : array[idx];
}
function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
        const k = Math.floor((i + j) / 2);
        if (predicate(array[k])) {
            i = k + 1;
        } else {
            j = k;
        }
    }
    return i - 1;
}
function findFirstMonotonous(array, predicate) {
    const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
    return idx === array.length ? undefined : array[idx];
}
function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
        const k = Math.floor((i + j) / 2);
        if (predicate(array[k])) {
            j = k;
        } else {
            i = k + 1;
        }
    }
    return i;
}
class MonotonousArray {
    static {
        this.assertInvariants = false;
    }
    constructor(_array) {
        this._array = _array;
        this._findLastMonotonousLastIdx = 0;
    }
    findLastMonotonous(predicate) {
        if (MonotonousArray.assertInvariants) {
            if (this._prevFindLastPredicate) {
                for (const item of this._array) {
                    if (this._prevFindLastPredicate(item) && !predicate(item)) {
                        throw ( new Error(
                            "MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate."
                        ));
                    }
                }
            }
            this._prevFindLastPredicate = predicate;
        }
        const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
        this._findLastMonotonousLastIdx = idx + 1;
        return idx === -1 ? undefined : this._array[idx];
    }
}
function findFirstMax(array, comparator) {
    if (array.length === 0) {
        return undefined;
    }
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, max) > 0) {
            max = item;
        }
    }
    return max;
}
function findLastMax(array, comparator) {
    if (array.length === 0) {
        return undefined;
    }
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, max) >= 0) {
            max = item;
        }
    }
    return max;
}
function findFirstMin(array, comparator) {
    return findFirstMax(array, (a, b) => -comparator(a, b));
}
function findMaxIdx(array, comparator) {
    if (array.length === 0) {
        return -1;
    }
    let maxIdx = 0;
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, array[maxIdx]) > 0) {
            maxIdx = i;
        }
    }
    return maxIdx;
}
function mapFindFirst(items, mapFn) {
    for (const value of items) {
        const mapped = mapFn(value);
        if (mapped !== undefined) {
            return mapped;
        }
    }
    return undefined;
}

export { MonotonousArray, findFirst, findFirstIdx, findFirstIdxMonotonousOrArrLen, findFirstMax, findFirstMin, findFirstMonotonous, findLast, findLastIdx, findLastIdxMonotonous, findLastMax, findLastMonotonous, findMaxIdx, mapFindFirst };
