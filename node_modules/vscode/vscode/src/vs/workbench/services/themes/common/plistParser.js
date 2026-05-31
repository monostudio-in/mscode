

var ChCode;
(function(ChCode) {
    ChCode[ChCode["BOM"] = 65279] = "BOM";
    ChCode[ChCode["SPACE"] = 32] = "SPACE";
    ChCode[ChCode["TAB"] = 9] = "TAB";
    ChCode[ChCode["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
    ChCode[ChCode["LINE_FEED"] = 10] = "LINE_FEED";
    ChCode[ChCode["SLASH"] = 47] = "SLASH";
    ChCode[ChCode["LESS_THAN"] = 60] = "LESS_THAN";
    ChCode[ChCode["QUESTION_MARK"] = 63] = "QUESTION_MARK";
    ChCode[ChCode["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
})(ChCode || (ChCode = {}));
var State;
(function(State) {
    State[State["ROOT_STATE"] = 0] = "ROOT_STATE";
    State[State["DICT_STATE"] = 1] = "DICT_STATE";
    State[State["ARR_STATE"] = 2] = "ARR_STATE";
})(State || (State = {}));
function parse(content) {
    return _parse(content);
}
function _parse(content, filename, locationKeyName) {
    const len = content.length;
    let pos = 0;
    if (len > 0 && content.charCodeAt(0) === ChCode.BOM) {
        pos = 1;
    }
    function advancePosBy(by) {
        {
            pos = pos + by;
        }
    }
    function advancePosTo(to) {
        {
            pos = to;
        }
    }
    function skipWhitespace() {
        while (pos < len) {
            const chCode = content.charCodeAt(pos);
            if (chCode !== ChCode.SPACE && chCode !== ChCode.TAB && chCode !== ChCode.CARRIAGE_RETURN && chCode !== ChCode.LINE_FEED) {
                break;
            }
            advancePosBy(1);
        }
    }
    function advanceIfStartsWith(str) {
        if (content.substr(pos, str.length) === str) {
            advancePosBy(str.length);
            return true;
        }
        return false;
    }
    function advanceUntil(str) {
        const nextOccurence = content.indexOf(str, pos);
        if (nextOccurence !== -1) {
            advancePosTo(nextOccurence + str.length);
        } else {
            advancePosTo(len);
        }
    }
    function captureUntil(str) {
        const nextOccurence = content.indexOf(str, pos);
        if (nextOccurence !== -1) {
            const r = content.substring(pos, nextOccurence);
            advancePosTo(nextOccurence + str.length);
            return r;
        } else {
            const r = content.substr(pos);
            advancePosTo(len);
            return r;
        }
    }
    let state = State.ROOT_STATE;
    let cur = null;
    const stateStack = [];
    const objStack = [];
    let curKey = null;
    function pushState(newState, newCur) {
        stateStack.push(state);
        objStack.push(cur);
        state = newState;
        cur = newCur;
    }
    function popState() {
        if (stateStack.length === 0) {
            return fail("illegal state stack");
        }
        state = stateStack.pop();
        cur = objStack.pop();
    }
    function fail(msg) {
        throw ( new Error(
            "Near offset " + pos + ": " + msg + " ~~~" + content.substr(pos, 50) + "~~~"
        ));
    }
    const dictState = {
        enterDict: function() {
            if (curKey === null) {
                return fail("missing <key>");
            }
            const newDict = {};
            cur[curKey] = newDict;
            curKey = null;
            pushState(State.DICT_STATE, newDict);
        },
        enterArray: function() {
            if (curKey === null) {
                return fail("missing <key>");
            }
            const newArr = [];
            cur[curKey] = newArr;
            curKey = null;
            pushState(State.ARR_STATE, newArr);
        }
    };
    const arrState = {
        enterDict: function() {
            const newDict = {};
            cur.push(newDict);
            pushState(State.DICT_STATE, newDict);
        },
        enterArray: function() {
            const newArr = [];
            cur.push(newArr);
            pushState(State.ARR_STATE, newArr);
        }
    };
    function enterDict() {
        if (state === State.DICT_STATE) {
            dictState.enterDict();
        } else if (state === State.ARR_STATE) {
            arrState.enterDict();
        } else {
            cur = {};
            pushState(State.DICT_STATE, cur);
        }
    }
    function leaveDict() {
        if (state === State.DICT_STATE) {
            popState();
        } else if (state === State.ARR_STATE) {
            return fail("unexpected </dict>");
        } else {
            return fail("unexpected </dict>");
        }
    }
    function enterArray() {
        if (state === State.DICT_STATE) {
            dictState.enterArray();
        } else if (state === State.ARR_STATE) {
            arrState.enterArray();
        } else {
            cur = [];
            pushState(State.ARR_STATE, cur);
        }
    }
    function leaveArray() {
        if (state === State.DICT_STATE) {
            return fail("unexpected </array>");
        } else if (state === State.ARR_STATE) {
            popState();
        } else {
            return fail("unexpected </array>");
        }
    }
    function acceptKey(val) {
        if (state === State.DICT_STATE) {
            if (curKey !== null) {
                return fail("too many <key>");
            }
            curKey = val;
        } else if (state === State.ARR_STATE) {
            return fail("unexpected <key>");
        } else {
            return fail("unexpected <key>");
        }
    }
    function acceptString(val) {
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function acceptReal(val) {
        if (isNaN(val)) {
            return fail("cannot parse float");
        }
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function acceptInteger(val) {
        if (isNaN(val)) {
            return fail("cannot parse integer");
        }
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function acceptDate(val) {
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function acceptData(val) {
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function acceptBool(val) {
        if (state === State.DICT_STATE) {
            if (curKey === null) {
                return fail("missing <key>");
            }
            cur[curKey] = val;
            curKey = null;
        } else if (state === State.ARR_STATE) {
            cur.push(val);
        } else {
            cur = val;
        }
    }
    function escapeVal(str) {
        return str.replace(/&#([0-9]+);/g, function(_, m0) {
            return String.fromCodePoint(parseInt(m0, 10));
        }).replace(/&#x([0-9a-f]+);/g, function(_, m0) {
            return String.fromCodePoint(parseInt(m0, 16));
        }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function(_) {
            switch (_) {
            case "&amp;":
                return "&";
            case "&lt;":
                return "<";
            case "&gt;":
                return ">";
            case "&quot;":
                return "\"";
            case "&apos;":
                return "'";
            }
            return _;
        });
    }
    function parseOpenTag() {
        let r = captureUntil(">");
        let isClosed = false;
        if (r.charCodeAt(r.length - 1) === ChCode.SLASH) {
            isClosed = true;
            r = r.substring(0, r.length - 1);
        }
        return {
            name: r.trim(),
            isClosed: isClosed
        };
    }
    function parseTagValue(tag) {
        if (tag.isClosed) {
            return "";
        }
        const val = captureUntil("</");
        advanceUntil(">");
        return escapeVal(val);
    }
    while (pos < len) {
        skipWhitespace();
        if (pos >= len) {
            break;
        }
        const chCode = content.charCodeAt(pos);
        advancePosBy(1);
        if (chCode !== ChCode.LESS_THAN) {
            return fail("expected <");
        }
        if (pos >= len) {
            return fail("unexpected end of input");
        }
        const peekChCode = content.charCodeAt(pos);
        if (peekChCode === ChCode.QUESTION_MARK) {
            advancePosBy(1);
            advanceUntil("?>");
            continue;
        }
        if (peekChCode === ChCode.EXCLAMATION_MARK) {
            advancePosBy(1);
            if (advanceIfStartsWith("--")) {
                advanceUntil("-->");
                continue;
            }
            advanceUntil(">");
            continue;
        }
        if (peekChCode === ChCode.SLASH) {
            advancePosBy(1);
            skipWhitespace();
            if (advanceIfStartsWith("plist")) {
                advanceUntil(">");
                continue;
            }
            if (advanceIfStartsWith("dict")) {
                advanceUntil(">");
                leaveDict();
                continue;
            }
            if (advanceIfStartsWith("array")) {
                advanceUntil(">");
                leaveArray();
                continue;
            }
            return fail("unexpected closed tag");
        }
        const tag = parseOpenTag();
        switch (tag.name) {
        case "dict":
            enterDict();
            if (tag.isClosed) {
                leaveDict();
            }
            continue;
        case "array":
            enterArray();
            if (tag.isClosed) {
                leaveArray();
            }
            continue;
        case "key":
            acceptKey(parseTagValue(tag));
            continue;
        case "string":
            acceptString(parseTagValue(tag));
            continue;
        case "real":
            acceptReal(parseFloat(parseTagValue(tag)));
            continue;
        case "integer":
            acceptInteger(parseInt(parseTagValue(tag), 10));
            continue;
        case "date":
            acceptDate(( new Date(parseTagValue(tag))));
            continue;
        case "data":
            acceptData(parseTagValue(tag));
            continue;
        case "true":
            parseTagValue(tag);
            acceptBool(true);
            continue;
        case "false":
            parseTagValue(tag);
            acceptBool(false);
            continue;
        }
        if (/^plist/.test(tag.name)) {
            continue;
        }
        return fail("unexpected opened tag " + tag.name);
    }
    return cur;
}

export { parse };
