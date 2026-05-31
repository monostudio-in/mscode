

class IdGenerator {
    constructor(prefix) {
        this._prefix = prefix;
        this._lastId = 0;
    }
    nextId() {
        return this._prefix + (++this._lastId);
    }
}
const defaultGenerator = ( new IdGenerator("id#"));

export { IdGenerator, defaultGenerator };
