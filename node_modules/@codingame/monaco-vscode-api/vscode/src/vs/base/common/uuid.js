

const _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID(value) {
    return _UUIDPattern.test(value);
}
const generateUuid = (function() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID.bind(crypto);
    }
    const _data = ( new Uint8Array(16));
    const _hex = [];
    for (let i = 0; i < 256; i++) {
        _hex.push(( i.toString(16)).padStart(2, "0"));
    }
    return function generateUuid() {
        crypto.getRandomValues(_data);
        _data[6] = (_data[6] & 0x0f) | 0x40;
        _data[8] = (_data[8] & 0x3f) | 0x80;
        let i = 0;
        let result = "";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += "-";
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        result += _hex[_data[i++]];
        return result;
    };
})();
function prefixedUuid(namespace) {
    return `${namespace}-${generateUuid()}`;
}

export { generateUuid, isUUID, prefixedUuid };
