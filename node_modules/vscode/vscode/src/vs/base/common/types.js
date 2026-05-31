
import { assert } from './assert.js';

function isString(str) {
    return (typeof str === "string");
}
function isStringArray(value) {
    return isArrayOf(value, isString);
}
function isArrayOf(value, check) {
    return Array.isArray(value) && value.every(check);
}
function isObject(obj) {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
}
function isTypedArray(obj) {
    const TypedArray = Object.getPrototypeOf(Uint8Array);
    return typeof obj === "object" && obj instanceof TypedArray;
}
function isNumber(obj) {
    return (typeof obj === "number" && !isNaN(obj));
}
function isIterable(obj) {
    return !!obj && typeof obj[Symbol.iterator] === "function";
}
function isBoolean(obj) {
    return (obj === true || obj === false);
}
function isUndefined(obj) {
    return (typeof obj === "undefined");
}
function isDefined(arg) {
    return !isUndefinedOrNull(arg);
}
function isUndefinedOrNull(obj) {
    return (isUndefined(obj) || obj === null);
}
function assertType(condition, type) {
    if (!condition) {
        throw ( new Error(type ? `Unexpected type, expected '${type}'` : "Unexpected type"));
    }
}
function assertReturnsDefined(arg) {
    assert(arg !== null && arg !== undefined, "Argument is `undefined` or `null`.");
    return arg;
}
function assertDefined(value, error) {
    if (value === null || value === undefined) {
        const errorToThrow = typeof error === "string" ? ( new Error(error)) : error;
        throw errorToThrow;
    }
}
function assertReturnsAllDefined(...args) {
    const result = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (isUndefinedOrNull(arg)) {
            throw ( new Error(`Assertion Failed: argument at index ${i} is undefined or null`));
        }
        result.push(arg);
    }
    return result;
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmptyObject(obj) {
    if (!isObject(obj)) {
        return false;
    }
    for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
function isFunction(obj) {
    return (typeof obj === "function");
}
function areFunctions(...objects) {
    return objects.length > 0 && objects.every(isFunction);
}
function validateConstraints(args, constraints) {
    const len = Math.min(args.length, constraints.length);
    for (let i = 0; i < len; i++) {
        validateConstraint(args[i], constraints[i]);
    }
}
function validateConstraint(arg, constraint) {
    if (isString(constraint)) {
        if (typeof arg !== constraint) {
            throw ( new Error(`argument does not match constraint: typeof ${constraint}`));
        }
    } else if (isFunction(constraint)) {
        try {
            if (arg instanceof constraint) {
                return;
            }
        } catch {}
        if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
            return;
        }
        if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
            return;
        }
        throw ( new Error(
            `argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`
        ));
    }
}
function upcast(x) {
    return x;
}
function hasKey(x, key) {
    for (const k in key) {
        if (!(k in x)) {
            return false;
        }
    }
    return true;
}

export { areFunctions, assertDefined, assertReturnsAllDefined, assertReturnsDefined, assertType, hasKey, isArrayOf, isBoolean, isDefined, isEmptyObject, isFunction, isIterable, isNumber, isObject, isString, isStringArray, isTypedArray, isUndefined, isUndefinedOrNull, upcast, validateConstraint, validateConstraints };
