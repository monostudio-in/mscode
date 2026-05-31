

var ScanError;
(function(ScanError) {
    ScanError[ScanError["None"] = 0] = "None";
    ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
    ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
    ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
    ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
    ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
    ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind) {
    SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
    SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
    SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
    SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
    SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
    SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
    SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
    SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
    SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
    SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
    SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
    SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
    SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
    SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
    SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
    SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
    SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var ParseErrorCode;
(function(ParseErrorCode) {
    ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
    ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
    ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
    ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
    ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
    ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
    ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
    ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
    ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
    ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
    ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
    ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
    ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
var ParseOptions;
(function(ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: true
    };
})(ParseOptions || (ParseOptions = {}));
function createScanner(text, ignoreTrivia = false) {
    let pos = 0;
    const len = text.length;
    let value = "";
    let tokenOffset = 0;
    let token = SyntaxKind.Unknown;
    let scanError = ScanError.None;
    function scanHexDigits(count) {
        let digits = 0;
        let hexValue = 0;
        while (digits < count) {
            const ch = text.charCodeAt(pos);
            if (ch >= CharacterCodes._0 && ch <= CharacterCodes._9) {
                hexValue = hexValue * 16 + ch - CharacterCodes._0;
            } else if (ch >= CharacterCodes.A && ch <= CharacterCodes.F) {
                hexValue = hexValue * 16 + ch - CharacterCodes.A + 10;
            } else if (ch >= CharacterCodes.a && ch <= CharacterCodes.f) {
                hexValue = hexValue * 16 + ch - CharacterCodes.a + 10;
            } else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            hexValue = -1;
        }
        return hexValue;
    }
    function setPosition(newPosition) {
        pos = newPosition;
        value = "";
        tokenOffset = 0;
        token = SyntaxKind.Unknown;
        scanError = ScanError.None;
    }
    function scanNumber() {
        const start = pos;
        if (text.charCodeAt(pos) === CharacterCodes._0) {
            pos++;
        } else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === CharacterCodes.dot) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            } else {
                scanError = ScanError.UnexpectedEndOfNumber;
                return text.substring(start, pos);
            }
        }
        let end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === CharacterCodes.E || text.charCodeAt(pos) === CharacterCodes.e)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === CharacterCodes.plus || text.charCodeAt(pos) === CharacterCodes.minus) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            } else {
                scanError = ScanError.UnexpectedEndOfNumber;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        let result = "", start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = ScanError.UnexpectedEndOfString;
                break;
            }
            const ch = text.charCodeAt(pos);
            if (ch === CharacterCodes.doubleQuote) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === CharacterCodes.backslash) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = ScanError.UnexpectedEndOfString;
                    break;
                }
                const ch2 = text.charCodeAt(pos++);
                switch (ch2) {
                case CharacterCodes.doubleQuote:
                    result += "\"";
                    break;
                case CharacterCodes.backslash:
                    result += "\\";
                    break;
                case CharacterCodes.slash:
                    result += "/";
                    break;
                case CharacterCodes.b:
                    result += "\b";
                    break;
                case CharacterCodes.f:
                    result += "\f";
                    break;
                case CharacterCodes.n:
                    result += "\n";
                    break;
                case CharacterCodes.r:
                    result += "\r";
                    break;
                case CharacterCodes.t:
                    result += "\t";
                    break;
                case CharacterCodes.u:
                    {
                        const ch3 = scanHexDigits(4);
                        if (ch3 >= 0) {
                            result += String.fromCharCode(ch3);
                        } else {
                            scanError = ScanError.InvalidUnicode;
                        }
                        break;
                    }
                default:
                    scanError = ScanError.InvalidEscapeCharacter;
                }
                start = pos;
                continue;
            }
            if (ch >= 0 && ch <= 0x1F) {
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    scanError = ScanError.UnexpectedEndOfString;
                    break;
                } else {
                    scanError = ScanError.InvalidCharacter;
                }
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = "";
        scanError = ScanError.None;
        tokenOffset = pos;
        if (pos >= len) {
            tokenOffset = len;
            return token = SyntaxKind.EOF;
        }
        let code = text.charCodeAt(pos);
        if (isWhitespace(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhitespace(code));
            return token = SyntaxKind.Trivia;
        }
        if (isLineBreak(code)) {
            pos++;
            value += String.fromCharCode(code);
            if (code === CharacterCodes.carriageReturn && text.charCodeAt(pos) === CharacterCodes.lineFeed) {
                pos++;
                value += "\n";
            }
            return token = SyntaxKind.LineBreakTrivia;
        }
        switch (code) {
        case CharacterCodes.openBrace:
            pos++;
            return token = SyntaxKind.OpenBraceToken;
        case CharacterCodes.closeBrace:
            pos++;
            return token = SyntaxKind.CloseBraceToken;
        case CharacterCodes.openBracket:
            pos++;
            return token = SyntaxKind.OpenBracketToken;
        case CharacterCodes.closeBracket:
            pos++;
            return token = SyntaxKind.CloseBracketToken;
        case CharacterCodes.colon:
            pos++;
            return token = SyntaxKind.ColonToken;
        case CharacterCodes.comma:
            pos++;
            return token = SyntaxKind.CommaToken;
        case CharacterCodes.doubleQuote:
            pos++;
            value = scanString();
            return token = SyntaxKind.StringLiteral;
        case CharacterCodes.slash:
            {
                const start = pos - 1;
                if (text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = SyntaxKind.LineCommentTrivia;
                }
                if (text.charCodeAt(pos + 1) === CharacterCodes.asterisk) {
                    pos += 2;
                    const safeLength = len - 1;
                    let commentClosed = false;
                    while (pos < safeLength) {
                        const ch = text.charCodeAt(pos);
                        if (ch === CharacterCodes.asterisk && text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = ScanError.UnexpectedEndOfComment;
                    }
                    value = text.substring(start, pos);
                    return token = SyntaxKind.BlockCommentTrivia;
                }
                value += String.fromCharCode(code);
                pos++;
                return token = SyntaxKind.Unknown;
            }
        case CharacterCodes.minus:
            value += String.fromCharCode(code);
            pos++;
            if (pos === len || !isDigit(text.charCodeAt(pos))) {
                return token = SyntaxKind.Unknown;
            }
        case CharacterCodes._0:
        case CharacterCodes._1:
        case CharacterCodes._2:
        case CharacterCodes._3:
        case CharacterCodes._4:
        case CharacterCodes._5:
        case CharacterCodes._6:
        case CharacterCodes._7:
        case CharacterCodes._8:
        case CharacterCodes._9:
            value += scanNumber();
            return token = SyntaxKind.NumericLiteral;
        default:
            while (pos < len && isUnknownContentCharacter(code)) {
                pos++;
                code = text.charCodeAt(pos);
            }
            if (tokenOffset !== pos) {
                value = text.substring(tokenOffset, pos);
                switch (value) {
                case "true":
                    return token = SyntaxKind.TrueKeyword;
                case "false":
                    return token = SyntaxKind.FalseKeyword;
                case "null":
                    return token = SyntaxKind.NullKeyword;
                }
                return token = SyntaxKind.Unknown;
            }
            value += String.fromCharCode(code);
            pos++;
            return token = SyntaxKind.Unknown;
        }
    }
    function isUnknownContentCharacter(code) {
        if (isWhitespace(code) || isLineBreak(code)) {
            return false;
        }
        switch (code) {
        case CharacterCodes.closeBrace:
        case CharacterCodes.closeBracket:
        case CharacterCodes.openBrace:
        case CharacterCodes.openBracket:
        case CharacterCodes.doubleQuote:
        case CharacterCodes.colon:
        case CharacterCodes.comma:
        case CharacterCodes.slash:
            return false;
        }
        return true;
    }
    function scanNextNonTrivia() {
        let result;
        do {
            result = scanNext();
        } while (result >= SyntaxKind.LineCommentTrivia && result <= SyntaxKind.Trivia);
        return result;
    }
    return {
        setPosition: setPosition,
        getPosition: () => pos,
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: () => token,
        getTokenValue: () => value,
        getTokenOffset: () => tokenOffset,
        getTokenLength: () => pos - tokenOffset,
        getTokenError: () => scanError
    };
}
function isWhitespace(ch) {
    return ch === CharacterCodes.space || ch === CharacterCodes.tab || ch === CharacterCodes.verticalTab || ch === CharacterCodes.formFeed || ch === CharacterCodes.nonBreakingSpace || ch === CharacterCodes.ogham || ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace || ch === CharacterCodes.narrowNoBreakSpace || ch === CharacterCodes.mathematicalSpace || ch === CharacterCodes.ideographicSpace || ch === CharacterCodes.byteOrderMark;
}
function isLineBreak(ch) {
    return ch === CharacterCodes.lineFeed || ch === CharacterCodes.carriageReturn || ch === CharacterCodes.lineSeparator || ch === CharacterCodes.paragraphSeparator;
}
function isDigit(ch) {
    return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
var CharacterCodes;
(function(CharacterCodes) {
    CharacterCodes[CharacterCodes["nullCharacter"] = 0] = "nullCharacter";
    CharacterCodes[CharacterCodes["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
    CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
    CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
    CharacterCodes[CharacterCodes["lineSeparator"] = 8232] = "lineSeparator";
    CharacterCodes[CharacterCodes["paragraphSeparator"] = 8233] = "paragraphSeparator";
    CharacterCodes[CharacterCodes["nextLine"] = 133] = "nextLine";
    CharacterCodes[CharacterCodes["space"] = 32] = "space";
    CharacterCodes[CharacterCodes["nonBreakingSpace"] = 160] = "nonBreakingSpace";
    CharacterCodes[CharacterCodes["enQuad"] = 8192] = "enQuad";
    CharacterCodes[CharacterCodes["emQuad"] = 8193] = "emQuad";
    CharacterCodes[CharacterCodes["enSpace"] = 8194] = "enSpace";
    CharacterCodes[CharacterCodes["emSpace"] = 8195] = "emSpace";
    CharacterCodes[CharacterCodes["threePerEmSpace"] = 8196] = "threePerEmSpace";
    CharacterCodes[CharacterCodes["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
    CharacterCodes[CharacterCodes["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
    CharacterCodes[CharacterCodes["figureSpace"] = 8199] = "figureSpace";
    CharacterCodes[CharacterCodes["punctuationSpace"] = 8200] = "punctuationSpace";
    CharacterCodes[CharacterCodes["thinSpace"] = 8201] = "thinSpace";
    CharacterCodes[CharacterCodes["hairSpace"] = 8202] = "hairSpace";
    CharacterCodes[CharacterCodes["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
    CharacterCodes[CharacterCodes["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
    CharacterCodes[CharacterCodes["ideographicSpace"] = 12288] = "ideographicSpace";
    CharacterCodes[CharacterCodes["mathematicalSpace"] = 8287] = "mathematicalSpace";
    CharacterCodes[CharacterCodes["ogham"] = 5760] = "ogham";
    CharacterCodes[CharacterCodes["_"] = 95] = "_";
    CharacterCodes[CharacterCodes["$"] = 36] = "$";
    CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
    CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
    CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
    CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
    CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
    CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
    CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
    CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
    CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
    CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
    CharacterCodes[CharacterCodes["a"] = 97] = "a";
    CharacterCodes[CharacterCodes["b"] = 98] = "b";
    CharacterCodes[CharacterCodes["c"] = 99] = "c";
    CharacterCodes[CharacterCodes["d"] = 100] = "d";
    CharacterCodes[CharacterCodes["e"] = 101] = "e";
    CharacterCodes[CharacterCodes["f"] = 102] = "f";
    CharacterCodes[CharacterCodes["g"] = 103] = "g";
    CharacterCodes[CharacterCodes["h"] = 104] = "h";
    CharacterCodes[CharacterCodes["i"] = 105] = "i";
    CharacterCodes[CharacterCodes["j"] = 106] = "j";
    CharacterCodes[CharacterCodes["k"] = 107] = "k";
    CharacterCodes[CharacterCodes["l"] = 108] = "l";
    CharacterCodes[CharacterCodes["m"] = 109] = "m";
    CharacterCodes[CharacterCodes["n"] = 110] = "n";
    CharacterCodes[CharacterCodes["o"] = 111] = "o";
    CharacterCodes[CharacterCodes["p"] = 112] = "p";
    CharacterCodes[CharacterCodes["q"] = 113] = "q";
    CharacterCodes[CharacterCodes["r"] = 114] = "r";
    CharacterCodes[CharacterCodes["s"] = 115] = "s";
    CharacterCodes[CharacterCodes["t"] = 116] = "t";
    CharacterCodes[CharacterCodes["u"] = 117] = "u";
    CharacterCodes[CharacterCodes["v"] = 118] = "v";
    CharacterCodes[CharacterCodes["w"] = 119] = "w";
    CharacterCodes[CharacterCodes["x"] = 120] = "x";
    CharacterCodes[CharacterCodes["y"] = 121] = "y";
    CharacterCodes[CharacterCodes["z"] = 122] = "z";
    CharacterCodes[CharacterCodes["A"] = 65] = "A";
    CharacterCodes[CharacterCodes["B"] = 66] = "B";
    CharacterCodes[CharacterCodes["C"] = 67] = "C";
    CharacterCodes[CharacterCodes["D"] = 68] = "D";
    CharacterCodes[CharacterCodes["E"] = 69] = "E";
    CharacterCodes[CharacterCodes["F"] = 70] = "F";
    CharacterCodes[CharacterCodes["G"] = 71] = "G";
    CharacterCodes[CharacterCodes["H"] = 72] = "H";
    CharacterCodes[CharacterCodes["I"] = 73] = "I";
    CharacterCodes[CharacterCodes["J"] = 74] = "J";
    CharacterCodes[CharacterCodes["K"] = 75] = "K";
    CharacterCodes[CharacterCodes["L"] = 76] = "L";
    CharacterCodes[CharacterCodes["M"] = 77] = "M";
    CharacterCodes[CharacterCodes["N"] = 78] = "N";
    CharacterCodes[CharacterCodes["O"] = 79] = "O";
    CharacterCodes[CharacterCodes["P"] = 80] = "P";
    CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
    CharacterCodes[CharacterCodes["R"] = 82] = "R";
    CharacterCodes[CharacterCodes["S"] = 83] = "S";
    CharacterCodes[CharacterCodes["T"] = 84] = "T";
    CharacterCodes[CharacterCodes["U"] = 85] = "U";
    CharacterCodes[CharacterCodes["V"] = 86] = "V";
    CharacterCodes[CharacterCodes["W"] = 87] = "W";
    CharacterCodes[CharacterCodes["X"] = 88] = "X";
    CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
    CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
    CharacterCodes[CharacterCodes["ampersand"] = 38] = "ampersand";
    CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
    CharacterCodes[CharacterCodes["at"] = 64] = "at";
    CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
    CharacterCodes[CharacterCodes["bar"] = 124] = "bar";
    CharacterCodes[CharacterCodes["caret"] = 94] = "caret";
    CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
    CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
    CharacterCodes[CharacterCodes["closeParen"] = 41] = "closeParen";
    CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
    CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
    CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
    CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
    CharacterCodes[CharacterCodes["equals"] = 61] = "equals";
    CharacterCodes[CharacterCodes["exclamation"] = 33] = "exclamation";
    CharacterCodes[CharacterCodes["greaterThan"] = 62] = "greaterThan";
    CharacterCodes[CharacterCodes["lessThan"] = 60] = "lessThan";
    CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
    CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
    CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
    CharacterCodes[CharacterCodes["openParen"] = 40] = "openParen";
    CharacterCodes[CharacterCodes["percent"] = 37] = "percent";
    CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
    CharacterCodes[CharacterCodes["question"] = 63] = "question";
    CharacterCodes[CharacterCodes["semicolon"] = 59] = "semicolon";
    CharacterCodes[CharacterCodes["singleQuote"] = 39] = "singleQuote";
    CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
    CharacterCodes[CharacterCodes["tilde"] = 126] = "tilde";
    CharacterCodes[CharacterCodes["backspace"] = 8] = "backspace";
    CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
    CharacterCodes[CharacterCodes["byteOrderMark"] = 65279] = "byteOrderMark";
    CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
    CharacterCodes[CharacterCodes["verticalTab"] = 11] = "verticalTab";
})(CharacterCodes || (CharacterCodes = {}));
function getLocation(text, position) {
    const segments = [];
    const earlyReturnException = ( new Object());
    let previousNode = undefined;
    const previousNodeInst = {
        value: {},
        offset: 0,
        length: 0,
        type: "object",
        parent: undefined
    };
    let isAtPropertyKey = false;
    function setPreviousNode(value, offset, length, type) {
        previousNodeInst.value = value;
        previousNodeInst.offset = offset;
        previousNodeInst.length = length;
        previousNodeInst.type = type;
        previousNodeInst.colonOffset = undefined;
        previousNode = previousNodeInst;
    }
    try {
        visit(text, {
            onObjectBegin: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                isAtPropertyKey = position > offset;
                segments.push("");
            },
            onObjectProperty: (name, offset, length) => {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(name, offset, length, "property");
                segments[segments.length - 1] = name;
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onObjectEnd: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onArrayBegin: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.push(0);
            },
            onArrayEnd: (offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onLiteralValue: (value, offset, length) => {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(value, offset, length, getNodeType(value));
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onSeparator: (sep, offset, length) => {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                if (sep === ":" && previousNode && previousNode.type === "property") {
                    previousNode.colonOffset = offset;
                    isAtPropertyKey = false;
                    previousNode = undefined;
                } else if (sep === ",") {
                    const last = segments[segments.length - 1];
                    if (typeof last === "number") {
                        segments[segments.length - 1] = last + 1;
                    } else {
                        isAtPropertyKey = true;
                        segments[segments.length - 1] = "";
                    }
                    previousNode = undefined;
                }
            }
        });
    } catch (e) {
        if (e !== earlyReturnException) {
            throw e;
        }
    }
    return {
        path: segments,
        previousNode,
        isAtPropertyKey,
        matches: pattern => {
            let k = 0;
            for (let i = 0; k < pattern.length && i < segments.length; i++) {
                if (pattern[k] === segments[i] || pattern[k] === "*") {
                    k++;
                } else if (pattern[k] !== "**") {
                    return false;
                }
            }
            return k === pattern.length;
        }
    };
}
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    function onValue(value) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        } else if (currentProperty !== null) {
            currentParent[currentProperty] = value;
        }
    }
    const visitor = {
        onObjectBegin: () => {
            const object = {};
            onValue(object);
            previousParents.push(currentParent);
            currentParent = object;
            currentProperty = null;
        },
        onObjectProperty: name => {
            currentProperty = name;
        },
        onObjectEnd: () => {
            currentParent = previousParents.pop();
        },
        onArrayBegin: () => {
            const array = [];
            onValue(array);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: () => {
            currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: (error, offset, length) => {
            errors.push({
                error,
                offset,
                length
            });
        }
    };
    visit(text, visitor, options);
    return currentParent[0];
}
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
    let currentParent = {
        type: "array",
        offset: -1,
        length: -1,
        children: [],
        parent: undefined
    };
    function ensurePropertyComplete(endOffset) {
        if (currentParent.type === "property") {
            currentParent.length = endOffset - currentParent.offset;
            currentParent = currentParent.parent;
        }
    }
    function onValue(valueNode) {
        currentParent.children.push(valueNode);
        return valueNode;
    }
    const visitor = {
        onObjectBegin: offset => {
            currentParent = onValue({
                type: "object",
                offset,
                length: -1,
                parent: currentParent,
                children: []
            });
        },
        onObjectProperty: (name, offset, length) => {
            currentParent = onValue({
                type: "property",
                offset,
                length: -1,
                parent: currentParent,
                children: []
            });
            currentParent.children.push({
                type: "string",
                value: name,
                offset,
                length,
                parent: currentParent
            });
        },
        onObjectEnd: (offset, length) => {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onArrayBegin: (offset, length) => {
            currentParent = onValue({
                type: "array",
                offset,
                length: -1,
                parent: currentParent,
                children: []
            });
        },
        onArrayEnd: (offset, length) => {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onLiteralValue: (value, offset, length) => {
            onValue({
                type: getNodeType(value),
                offset,
                length,
                parent: currentParent,
                value
            });
            ensurePropertyComplete(offset + length);
        },
        onSeparator: (sep, offset, length) => {
            if (currentParent.type === "property") {
                if (sep === ":") {
                    currentParent.colonOffset = offset;
                } else if (sep === ",") {
                    ensurePropertyComplete(offset);
                }
            }
        },
        onError: (error, offset, length) => {
            errors.push({
                error,
                offset,
                length
            });
        }
    };
    visit(text, visitor, options);
    const result = currentParent.children[0];
    if (result) {
        delete result.parent;
    }
    return result;
}
function findNodeAtLocation(root, path) {
    if (!root) {
        return undefined;
    }
    let node = root;
    for (const segment of path) {
        if (typeof segment === "string") {
            if (node.type !== "object" || !Array.isArray(node.children)) {
                return undefined;
            }
            let found = false;
            for (const propertyNode of node.children) {
                if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                    node = propertyNode.children[1];
                    found = true;
                    break;
                }
            }
            if (!found) {
                return undefined;
            }
        } else {
            const index = segment;
            if (node.type !== "array" || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                return undefined;
            }
            node = node.children[index];
        }
    }
    return node;
}
function getNodePath(node) {
    if (!node.parent || !node.parent.children) {
        return [];
    }
    const path = getNodePath(node.parent);
    if (node.parent.type === "property") {
        const key = node.parent.children[0].value;
        path.push(key);
    } else if (node.parent.type === "array") {
        const index = node.parent.children.indexOf(node);
        if (index !== -1) {
            path.push(index);
        }
    }
    return path;
}
function contains(node, offset, includeRightBound = false) {
    return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
}
function findNodeAtOffset(node, offset, includeRightBound = false) {
    if (contains(node, offset, includeRightBound)) {
        const children = node.children;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                const item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
    const _scanner = createScanner(text, false);
    function toNoArgVisit(visitFunction) {
        return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
    }
    function toOneArgVisit(visitFunction) {
        return visitFunction ? arg => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
    }
    const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
    const disallowComments = options && options.disallowComments;
    const allowTrailingComma = options && options.allowTrailingComma;
    function scanNext() {
        while (true) {
            const token = _scanner.scan();
            switch (_scanner.getTokenError()) {
            case ScanError.InvalidUnicode:
                handleError(ParseErrorCode.InvalidUnicode);
                break;
            case ScanError.InvalidEscapeCharacter:
                handleError(ParseErrorCode.InvalidEscapeCharacter);
                break;
            case ScanError.UnexpectedEndOfNumber:
                handleError(ParseErrorCode.UnexpectedEndOfNumber);
                break;
            case ScanError.UnexpectedEndOfComment:
                if (!disallowComments) {
                    handleError(ParseErrorCode.UnexpectedEndOfComment);
                }
                break;
            case ScanError.UnexpectedEndOfString:
                handleError(ParseErrorCode.UnexpectedEndOfString);
                break;
            case ScanError.InvalidCharacter:
                handleError(ParseErrorCode.InvalidCharacter);
                break;
            }
            switch (token) {
            case SyntaxKind.LineCommentTrivia:
            case SyntaxKind.BlockCommentTrivia:
                if (disallowComments) {
                    handleError(ParseErrorCode.InvalidCommentToken);
                } else {
                    onComment();
                }
                break;
            case SyntaxKind.Unknown:
                handleError(ParseErrorCode.InvalidSymbol);
                break;
            case SyntaxKind.Trivia:
            case SyntaxKind.LineBreakTrivia:
                break;
            default:
                return token;
            }
        }
    }
    function handleError(error, skipUntilAfter = [], skipUntil = []) {
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
            let token = _scanner.getToken();
            while (token !== SyntaxKind.EOF) {
                if (skipUntilAfter.indexOf(token) !== -1) {
                    scanNext();
                    break;
                } else if (skipUntil.indexOf(token) !== -1) {
                    break;
                }
                token = scanNext();
            }
        }
    }
    function parseString(isValue) {
        const value = _scanner.getTokenValue();
        if (isValue) {
            onLiteralValue(value);
        } else {
            onObjectProperty(value);
        }
        scanNext();
        return true;
    }
    function parseLiteral() {
        switch (_scanner.getToken()) {
        case SyntaxKind.NumericLiteral:
            {
                let value = 0;
                try {
                    value = JSON.parse(_scanner.getTokenValue());
                    if (typeof value !== "number") {
                        handleError(ParseErrorCode.InvalidNumberFormat);
                        value = 0;
                    }
                } catch (e) {
                    handleError(ParseErrorCode.InvalidNumberFormat);
                }
                onLiteralValue(value);
                break;
            }
        case SyntaxKind.NullKeyword:
            onLiteralValue(null);
            break;
        case SyntaxKind.TrueKeyword:
            onLiteralValue(true);
            break;
        case SyntaxKind.FalseKeyword:
            onLiteralValue(false);
            break;
        default:
            return false;
        }
        scanNext();
        return true;
    }
    function parseProperty() {
        if (_scanner.getToken() !== SyntaxKind.StringLiteral) {
            handleError(
                ParseErrorCode.PropertyNameExpected,
                [],
                [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]
            );
            return false;
        }
        parseString(false);
        if (_scanner.getToken() === SyntaxKind.ColonToken) {
            onSeparator(":");
            scanNext();
            if (!parseValue()) {
                handleError(
                    ParseErrorCode.ValueExpected,
                    [],
                    [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]
                );
            }
        } else {
            handleError(
                ParseErrorCode.ColonExpected,
                [],
                [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]
            );
        }
        return true;
    }
    function parseObject() {
        onObjectBegin();
        scanNext();
        let needsComma = false;
        while (_scanner.getToken() !== SyntaxKind.CloseBraceToken && _scanner.getToken() !== SyntaxKind.EOF) {
            if (_scanner.getToken() === SyntaxKind.CommaToken) {
                if (!needsComma) {
                    handleError(ParseErrorCode.ValueExpected, [], []);
                }
                onSeparator(",");
                scanNext();
                if (_scanner.getToken() === SyntaxKind.CloseBraceToken && allowTrailingComma) {
                    break;
                }
            } else if (needsComma) {
                handleError(ParseErrorCode.CommaExpected, [], []);
            }
            if (!parseProperty()) {
                handleError(
                    ParseErrorCode.ValueExpected,
                    [],
                    [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]
                );
            }
            needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== SyntaxKind.CloseBraceToken) {
            handleError(ParseErrorCode.CloseBraceExpected, [SyntaxKind.CloseBraceToken], []);
        } else {
            scanNext();
        }
        return true;
    }
    function parseArray() {
        onArrayBegin();
        scanNext();
        let needsComma = false;
        while (_scanner.getToken() !== SyntaxKind.CloseBracketToken && _scanner.getToken() !== SyntaxKind.EOF) {
            if (_scanner.getToken() === SyntaxKind.CommaToken) {
                if (!needsComma) {
                    handleError(ParseErrorCode.ValueExpected, [], []);
                }
                onSeparator(",");
                scanNext();
                if (_scanner.getToken() === SyntaxKind.CloseBracketToken && allowTrailingComma) {
                    break;
                }
            } else if (needsComma) {
                handleError(ParseErrorCode.CommaExpected, [], []);
            }
            if (!parseValue()) {
                handleError(
                    ParseErrorCode.ValueExpected,
                    [],
                    [SyntaxKind.CloseBracketToken, SyntaxKind.CommaToken]
                );
            }
            needsComma = true;
        }
        onArrayEnd();
        if (_scanner.getToken() !== SyntaxKind.CloseBracketToken) {
            handleError(ParseErrorCode.CloseBracketExpected, [SyntaxKind.CloseBracketToken], []);
        } else {
            scanNext();
        }
        return true;
    }
    function parseValue() {
        switch (_scanner.getToken()) {
        case SyntaxKind.OpenBracketToken:
            return parseArray();
        case SyntaxKind.OpenBraceToken:
            return parseObject();
        case SyntaxKind.StringLiteral:
            return parseString(true);
        default:
            return parseLiteral();
        }
    }
    scanNext();
    if (_scanner.getToken() === SyntaxKind.EOF) {
        if (options.allowEmptyContent) {
            return true;
        }
        handleError(ParseErrorCode.ValueExpected, [], []);
        return false;
    }
    if (!parseValue()) {
        handleError(ParseErrorCode.ValueExpected, [], []);
        return false;
    }
    if (_scanner.getToken() !== SyntaxKind.EOF) {
        handleError(ParseErrorCode.EndOfFileExpected, [], []);
    }
    return true;
}
function getNodeType(value) {
    switch (typeof value) {
    case "boolean":
        return "boolean";
    case "number":
        return "number";
    case "string":
        return "string";
    case "object":
        {
            if (!value) {
                return "null";
            } else if (Array.isArray(value)) {
                return "array";
            }
            return "object";
        }
    default:
        return "null";
    }
}

export { ParseErrorCode, ParseOptions, ScanError, SyntaxKind, contains, createScanner, findNodeAtLocation, findNodeAtOffset, getLocation, getNodePath, getNodeType, parse, parseTree, visit };
