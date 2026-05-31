

class ProxyIdentifier {
    static {
        this.count = 0;
    }
    constructor(sid) {
        this._proxyIdentifierBrand = undefined;
        this.sid = sid;
        this.nid = (++ProxyIdentifier.count);
    }
}
const identifiers = [];
function createProxyIdentifier(identifier) {
    const result = ( new ProxyIdentifier(identifier));
    identifiers[result.nid] = result;
    return result;
}
function getStringIdentifierForProxy(nid) {
    return identifiers[nid].sid;
}
class SerializableObjectWithBuffers {
    constructor(value) {
        this.value = value;
    }
}

export { ProxyIdentifier, SerializableObjectWithBuffers, createProxyIdentifier, getStringIdentifierForProxy };
