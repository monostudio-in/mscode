
import { CharCode } from '../../../base/common/charCode.js';
import { StandardTokenType } from '../encodedTokenAttributes.js';

var IndentAction;
(function(IndentAction) {
    IndentAction[IndentAction["None"] = 0] = "None";
    IndentAction[IndentAction["Indent"] = 1] = "Indent";
    IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
    IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
})(IndentAction || (IndentAction = {}));
class StandardAutoClosingPairConditional {
    constructor(source) {
        this._neutralCharacter = null;
        this._neutralCharacterSearched = false;
        this.open = source.open;
        this.close = source.close;
        this._inString = true;
        this._inComment = true;
        this._inRegEx = true;
        if (Array.isArray(source.notIn)) {
            for (let i = 0, len = source.notIn.length; i < len; i++) {
                const notIn = source.notIn[i];
                switch (notIn) {
                case "string":
                    this._inString = false;
                    break;
                case "comment":
                    this._inComment = false;
                    break;
                case "regex":
                    this._inRegEx = false;
                    break;
                }
            }
        }
    }
    isOK(standardToken) {
        switch (standardToken) {
        case StandardTokenType.Other:
            return true;
        case StandardTokenType.Comment:
            return this._inComment;
        case StandardTokenType.String:
            return this._inString;
        case StandardTokenType.RegEx:
            return this._inRegEx;
        }
    }
    shouldAutoClose(context, column) {
        if (context.getTokenCount() === 0) {
            return true;
        }
        const tokenIndex = context.findTokenIndexAtOffset(column - 2);
        const standardTokenType = context.getStandardTokenType(tokenIndex);
        return this.isOK(standardTokenType);
    }
    _findNeutralCharacterInRange(fromCharCode, toCharCode) {
        for (let charCode = fromCharCode; charCode <= toCharCode; charCode++) {
            const character = String.fromCharCode(charCode);
            if (!this.open.includes(character) && !this.close.includes(character)) {
                return character;
            }
        }
        return null;
    }
    findNeutralCharacter() {
        if (!this._neutralCharacterSearched) {
            this._neutralCharacterSearched = true;
            if (!this._neutralCharacter) {
                this._neutralCharacter = this._findNeutralCharacterInRange(CharCode.Digit0, CharCode.Digit9);
            }
            if (!this._neutralCharacter) {
                this._neutralCharacter = this._findNeutralCharacterInRange(CharCode.a, CharCode.z);
            }
            if (!this._neutralCharacter) {
                this._neutralCharacter = this._findNeutralCharacterInRange(CharCode.A, CharCode.Z);
            }
        }
        return this._neutralCharacter;
    }
}
class AutoClosingPairs {
    constructor(autoClosingPairs) {
        this.autoClosingPairsOpenByStart = ( new Map());
        this.autoClosingPairsOpenByEnd = ( new Map());
        this.autoClosingPairsCloseByStart = ( new Map());
        this.autoClosingPairsCloseByEnd = ( new Map());
        this.autoClosingPairsCloseSingleChar = ( new Map());
        for (const pair of autoClosingPairs) {
            appendEntry(this.autoClosingPairsOpenByStart, pair.open.charAt(0), pair);
            appendEntry(
                this.autoClosingPairsOpenByEnd,
                pair.open.charAt(pair.open.length - 1),
                pair
            );
            appendEntry(this.autoClosingPairsCloseByStart, pair.close.charAt(0), pair);
            appendEntry(
                this.autoClosingPairsCloseByEnd,
                pair.close.charAt(pair.close.length - 1),
                pair
            );
            if (pair.close.length === 1 && pair.open.length === 1) {
                appendEntry(this.autoClosingPairsCloseSingleChar, pair.close, pair);
            }
        }
    }
}
function appendEntry(target, key, value) {
    if (( target.has(key))) {
        target.get(key).push(value);
    } else {
        target.set(key, [value]);
    }
}

export { AutoClosingPairs, IndentAction, StandardAutoClosingPairConditional };
