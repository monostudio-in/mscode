
import { OffsetRange } from '../core/ranges/offsetRange.js';
import { LineTokens } from './lineTokens.js';

class TokenWithTextArray {
    static fromLineTokens(lineTokens) {
        const tokenInfo = [];
        for (let i = 0; i < lineTokens.getCount(); i++) {
            tokenInfo.push(( new TokenWithTextInfo(lineTokens.getTokenText(i), lineTokens.getMetadata(i))));
        }
        return TokenWithTextArray.create(tokenInfo);
    }
    static create(tokenInfo) {
        return ( new TokenWithTextArray(tokenInfo));
    }
    constructor(_tokenInfo) {
        this._tokenInfo = _tokenInfo;
    }
    toLineTokens(decoder) {
        return LineTokens.createFromTextAndMetadata(( this.map((_r, t) => ({
            text: t.text,
            metadata: t.metadata
        }))), decoder);
    }
    forEach(cb) {
        let lengthSum = 0;
        for (const tokenInfo of this._tokenInfo) {
            const range = ( new OffsetRange(lengthSum, lengthSum + tokenInfo.text.length));
            cb(range, tokenInfo);
            lengthSum += tokenInfo.text.length;
        }
    }
    map(cb) {
        const result = [];
        let lengthSum = 0;
        for (const tokenInfo of this._tokenInfo) {
            const range = ( new OffsetRange(lengthSum, lengthSum + tokenInfo.text.length));
            result.push(cb(range, tokenInfo));
            lengthSum += tokenInfo.text.length;
        }
        return result;
    }
    slice(range) {
        const result = [];
        let lengthSum = 0;
        for (const tokenInfo of this._tokenInfo) {
            const tokenStart = lengthSum;
            const tokenEndEx = tokenStart + tokenInfo.text.length;
            if (tokenEndEx > range.start) {
                if (tokenStart >= range.endExclusive) {
                    break;
                }
                const deltaBefore = Math.max(0, range.start - tokenStart);
                const deltaAfter = Math.max(0, tokenEndEx - range.endExclusive);
                result.push(( new TokenWithTextInfo(
                    tokenInfo.text.slice(deltaBefore, tokenInfo.text.length - deltaAfter),
                    tokenInfo.metadata
                )));
            }
            lengthSum += tokenInfo.text.length;
        }
        return TokenWithTextArray.create(result);
    }
    append(other) {
        const result = this._tokenInfo.concat(other._tokenInfo);
        return TokenWithTextArray.create(result);
    }
}
class TokenWithTextInfo {
    constructor(text, metadata) {
        this.text = text;
        this.metadata = metadata;
    }
}

export { TokenWithTextArray, TokenWithTextInfo };
