
import { localize } from '../../nls.js';
import { ParseErrorCode } from './json.js';

function getParseErrorMessage(errorCode) {
    switch (errorCode) {
    case ParseErrorCode.InvalidSymbol:
        return localize(116, "Invalid symbol");
    case ParseErrorCode.InvalidNumberFormat:
        return localize(117, "Invalid number format");
    case ParseErrorCode.PropertyNameExpected:
        return localize(118, "Property name expected");
    case ParseErrorCode.ValueExpected:
        return localize(119, "Value expected");
    case ParseErrorCode.ColonExpected:
        return localize(120, "Colon expected");
    case ParseErrorCode.CommaExpected:
        return localize(121, "Comma expected");
    case ParseErrorCode.CloseBraceExpected:
        return localize(122, "Closing brace expected");
    case ParseErrorCode.CloseBracketExpected:
        return localize(123, "Closing bracket expected");
    case ParseErrorCode.EndOfFileExpected:
        return localize(124, "End of file expected");
    default:
        return "";
    }
}

export { getParseErrorMessage };
