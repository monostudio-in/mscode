
import { createScanner, SyntaxKind, ScanError } from './json.js';

function format(documentText, range, options) {
    let initialIndentLevel;
    let formatText;
    let formatTextStart;
    let rangeStart;
    let rangeEnd;
    if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
            formatTextStart--;
        }
        let endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
            endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
    }
    else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
    }
    const eol = getEOL(options, documentText);
    let lineBreak = false;
    let indentLevel = 0;
    let indentValue;
    if (options.insertSpaces) {
        indentValue = repeat(' ', options.tabSize || 4);
    }
    else {
        indentValue = '\t';
    }
    const scanner = createScanner(formatText, false);
    let hasError = false;
    function newLineAndIndent() {
        return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    function scanNext() {
        let token = scanner.scan();
        lineBreak = false;
        while (token === SyntaxKind.Trivia || token === SyntaxKind.LineBreakTrivia) {
            lineBreak = lineBreak || (token === SyntaxKind.LineBreakTrivia);
            token = scanner.scan();
        }
        hasError = token === SyntaxKind.Unknown || scanner.getTokenError() !== ScanError.None;
        return token;
    }
    const editOperations = [];
    function addEdit(text, startOffset, endOffset) {
        if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
            editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
        }
    }
    let firstToken = scanNext();
    if (firstToken !== SyntaxKind.EOF) {
        const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        const initialIndent = repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
    }
    while (firstToken !== SyntaxKind.EOF) {
        let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        let secondToken = scanNext();
        let replaceContent = '';
        while (!lineBreak && (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia)) {
            const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(' ', firstTokenEnd, commentTokenStart);
            firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            replaceContent = secondToken === SyntaxKind.LineCommentTrivia ? newLineAndIndent() : '';
            secondToken = scanNext();
        }
        if (secondToken === SyntaxKind.CloseBraceToken) {
            if (firstToken !== SyntaxKind.OpenBraceToken) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else if (secondToken === SyntaxKind.CloseBracketToken) {
            if (firstToken !== SyntaxKind.OpenBracketToken) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else {
            switch (firstToken) {
                case SyntaxKind.OpenBracketToken:
                case SyntaxKind.OpenBraceToken:
                    indentLevel++;
                    replaceContent = newLineAndIndent();
                    break;
                case SyntaxKind.CommaToken:
                case SyntaxKind.LineCommentTrivia:
                    replaceContent = newLineAndIndent();
                    break;
                case SyntaxKind.BlockCommentTrivia:
                    if (lineBreak) {
                        replaceContent = newLineAndIndent();
                    }
                    else {
                        replaceContent = ' ';
                    }
                    break;
                case SyntaxKind.ColonToken:
                    replaceContent = ' ';
                    break;
                case SyntaxKind.StringLiteral:
                    if (secondToken === SyntaxKind.ColonToken) {
                        replaceContent = '';
                        break;
                    }
                case SyntaxKind.NullKeyword:
                case SyntaxKind.TrueKeyword:
                case SyntaxKind.FalseKeyword:
                case SyntaxKind.NumericLiteral:
                case SyntaxKind.CloseBraceToken:
                case SyntaxKind.CloseBracketToken:
                    if (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia) {
                        replaceContent = ' ';
                    }
                    else if (secondToken !== SyntaxKind.CommaToken && secondToken !== SyntaxKind.EOF) {
                        hasError = true;
                    }
                    break;
                case SyntaxKind.Unknown:
                    hasError = true;
                    break;
            }
            if (lineBreak && (secondToken === SyntaxKind.LineCommentTrivia || secondToken === SyntaxKind.BlockCommentTrivia)) {
                replaceContent = newLineAndIndent();
            }
        }
        const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
    }
    return editOperations;
}
function toFormattedString(obj, options) {
    const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
    if (options.eol !== undefined) {
        return content.replace(/\r\n|\r|\n/g, options.eol);
    }
    return content;
}
function repeat(s, count) {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += s;
    }
    return result;
}
function computeIndentLevel(content, options) {
    let i = 0;
    let nChars = 0;
    const tabSize = options.tabSize || 4;
    while (i < content.length) {
        const ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
    for (let i = 0; i < text.length; i++) {
        const ch = text.charAt(i);
        if (ch === '\r') {
            if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                return '\r\n';
            }
            return '\r';
        }
        else if (ch === '\n') {
            return '\n';
        }
    }
    return (options && options.eol) || '\n';
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}

export { format, getEOL, isEOL, toFormattedString };
