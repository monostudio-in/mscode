

var Constants;
(function (Constants) {
    Constants[Constants["MAX_SAFE_SMALL_INTEGER"] = 1073741824] = "MAX_SAFE_SMALL_INTEGER";
    Constants[Constants["MIN_SAFE_SMALL_INTEGER"] = -1073741824] = "MIN_SAFE_SMALL_INTEGER";
    Constants[Constants["MAX_UINT_8"] = 255] = "MAX_UINT_8";
    Constants[Constants["MAX_UINT_16"] = 65535] = "MAX_UINT_16";
    Constants[Constants["MAX_UINT_32"] = 4294967295] = "MAX_UINT_32";
    Constants[Constants["UNICODE_SUPPLEMENTARY_PLANE_BEGIN"] = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
})(Constants || (Constants = {}));
function toUint8(v) {
    if (v < 0) {
        return 0;
    }
    if (v > Constants.MAX_UINT_8) {
        return Constants.MAX_UINT_8;
    }
    return v | 0;
}
function toUint32(v) {
    if (v < 0) {
        return 0;
    }
    if (v > Constants.MAX_UINT_32) {
        return Constants.MAX_UINT_32;
    }
    return v | 0;
}

export { Constants, toUint32, toUint8 };
