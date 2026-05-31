
import { equals as equals$1 } from './arrays.js';

function strictEquals(a, b) {
    return a === b;
}
function strictEqualsC() {
    return (a, b) => a === b;
}
function arrayEquals(a, b, itemEquals) {
    return equals$1(a, b, itemEquals ?? strictEquals);
}
function arrayEqualsC(itemEquals) {
    return (a, b) => equals$1(a, b, itemEquals ?? strictEquals);
}
function structuralEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!structuralEquals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
        if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
            const aObj = a;
            const bObj = b;
            const keysA = ( Object.keys(aObj));
            const keysB = ( Object.keys(bObj));
            const keysBSet = ( new Set(keysB));
            if (keysA.length !== keysB.length) {
                return false;
            }
            for (const key of keysA) {
                if (!( keysBSet.has(key))) {
                    return false;
                }
                if (!structuralEquals(aObj[key], bObj[key])) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}
function structuralEqualsC() {
    return (a, b) => structuralEquals(a, b);
}
function getStructuralKey(t) {
    return JSON.stringify(toNormalizedJsonStructure(t));
}
let objectId = 0;
const objIds = ( new WeakMap());
function toNormalizedJsonStructure(t) {
    if (Array.isArray(t)) {
        return ( t.map(toNormalizedJsonStructure));
    }
    if (t && typeof t === "object") {
        if (Object.getPrototypeOf(t) === Object.prototype) {
            const tObj = t;
            const res = Object.create(null);
            for (const key of ( Object.keys(tObj)).sort()) {
                res[key] = toNormalizedJsonStructure(tObj[key]);
            }
            return res;
        } else {
            let objId = objIds.get(t);
            if (objId === undefined) {
                objId = objectId++;
                objIds.set(t, objId);
            }
            return objId + "----2b76a038c20c4bcc";
        }
    }
    return t;
}
function jsonStringifyEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function jsonStringifyEqualsC() {
    return (a, b) => JSON.stringify(a) === JSON.stringify(b);
}
function thisEqualsC() {
    return (a, b) => a.equals(b);
}
function equalsIfDefined(v1, v2, equals) {
    if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
        return v2 === v1;
    }
    return equals(v1, v2);
}
function equalsIfDefinedC(equals) {
    return (v1, v2) => {
        if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
            return v2 === v1;
        }
        return equals(v1, v2);
    };
}
var equals;
(function(equals) {
    equals.strict = strictEquals;
    equals.strictC = strictEqualsC;
    equals.array = arrayEquals;
    equals.arrayC = arrayEqualsC;
    equals.structural = structuralEquals;
    equals.structuralC = structuralEqualsC;
    equals.jsonStringify = jsonStringifyEquals;
    equals.jsonStringifyC = jsonStringifyEqualsC;
    equals.thisC = thisEqualsC;
    equals.ifDefined = equalsIfDefined;
    equals.ifDefinedC = equalsIfDefinedC;
})(equals || (equals = {}));

export { arrayEquals, arrayEqualsC, equals, equalsIfDefined, equalsIfDefinedC, getStructuralKey, jsonStringifyEquals, jsonStringifyEqualsC, strictEquals, strictEqualsC, structuralEquals, structuralEqualsC, thisEqualsC };
