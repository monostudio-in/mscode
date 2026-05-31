
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { URI } from '../../../../base/common/uri.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Position } from './position.js';
import { Range } from './range.js';

var Location_1;
let Location = Location_1 = class Location {
    static isLocation(thing) {
        if (thing instanceof Location_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(thing.range) && URI.isUri(thing.uri);
    }
    constructor(uri, rangeOrPosition) {
        this.uri = uri;
        if (!rangeOrPosition)
            ; else if (Range.isRange(rangeOrPosition)) {
            this.range = Range.of(rangeOrPosition);
        } else if (Position.isPosition(rangeOrPosition)) {
            this.range = ( new Range(rangeOrPosition, rangeOrPosition));
        } else {
            throw ( new Error("Illegal argument"));
        }
    }
    toJSON() {
        return {
            uri: this.uri,
            range: this.range
        };
    }
};
Location = Location_1 = ( __decorate([es5ClassCompat], Location));

export { Location };
