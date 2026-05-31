
import { CharCode } from '../../../../base/common/charCode.js';

var StringEOL;
(function (StringEOL) {
    StringEOL[StringEOL["Unknown"] = 0] = "Unknown";
    StringEOL[StringEOL["Invalid"] = 3] = "Invalid";
    StringEOL[StringEOL["LF"] = 1] = "LF";
    StringEOL[StringEOL["CRLF"] = 2] = "CRLF";
})(StringEOL || (StringEOL = {}));
function countEOL(text) {
    let eolCount = 0;
    let firstLineLength = 0;
    let lastLineStart = 0;
    let eol = StringEOL.Unknown;
    for (let i = 0, len = text.length; i < len; i++) {
        const chr = text.charCodeAt(i);
        if (chr === CharCode.CarriageReturn) {
            if (eolCount === 0) {
                firstLineLength = i;
            }
            eolCount++;
            if (i + 1 < len && text.charCodeAt(i + 1) === CharCode.LineFeed) {
                eol |= StringEOL.CRLF;
                i++;
            }
            else {
                eol |= StringEOL.Invalid;
            }
            lastLineStart = i + 1;
        }
        else if (chr === CharCode.LineFeed) {
            eol |= StringEOL.LF;
            if (eolCount === 0) {
                firstLineLength = i;
            }
            eolCount++;
            lastLineStart = i + 1;
        }
    }
    if (eolCount === 0) {
        firstLineLength = text.length;
    }
    return [eolCount, firstLineLength, text.length - lastLineStart, eol];
}

export { StringEOL, countEOL };
