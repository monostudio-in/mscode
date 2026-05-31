

var LanguageId;
(function (LanguageId) {
    LanguageId[LanguageId["Null"] = 0] = "Null";
    LanguageId[LanguageId["PlainText"] = 1] = "PlainText";
})(LanguageId || (LanguageId = {}));
var FontStyle;
(function (FontStyle) {
    FontStyle[FontStyle["NotSet"] = -1] = "NotSet";
    FontStyle[FontStyle["None"] = 0] = "None";
    FontStyle[FontStyle["Italic"] = 1] = "Italic";
    FontStyle[FontStyle["Bold"] = 2] = "Bold";
    FontStyle[FontStyle["Underline"] = 4] = "Underline";
    FontStyle[FontStyle["Strikethrough"] = 8] = "Strikethrough";
})(FontStyle || (FontStyle = {}));
var ColorId;
(function (ColorId) {
    ColorId[ColorId["None"] = 0] = "None";
    ColorId[ColorId["DefaultForeground"] = 1] = "DefaultForeground";
    ColorId[ColorId["DefaultBackground"] = 2] = "DefaultBackground";
})(ColorId || (ColorId = {}));
var StandardTokenType;
(function (StandardTokenType) {
    StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
    StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
    StandardTokenType[StandardTokenType["String"] = 2] = "String";
    StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
})(StandardTokenType || (StandardTokenType = {}));
var MetadataConsts;
(function (MetadataConsts) {
    MetadataConsts[MetadataConsts["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
    MetadataConsts[MetadataConsts["TOKEN_TYPE_MASK"] = 768] = "TOKEN_TYPE_MASK";
    MetadataConsts[MetadataConsts["BALANCED_BRACKETS_MASK"] = 1024] = "BALANCED_BRACKETS_MASK";
    MetadataConsts[MetadataConsts["FONT_STYLE_MASK"] = 30720] = "FONT_STYLE_MASK";
    MetadataConsts[MetadataConsts["FOREGROUND_MASK"] = 16744448] = "FOREGROUND_MASK";
    MetadataConsts[MetadataConsts["BACKGROUND_MASK"] = 4278190080] = "BACKGROUND_MASK";
    MetadataConsts[MetadataConsts["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
    MetadataConsts[MetadataConsts["BOLD_MASK"] = 4096] = "BOLD_MASK";
    MetadataConsts[MetadataConsts["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
    MetadataConsts[MetadataConsts["STRIKETHROUGH_MASK"] = 16384] = "STRIKETHROUGH_MASK";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_STRIKETHROUGH"] = 8] = "SEMANTIC_USE_STRIKETHROUGH";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_FOREGROUND"] = 16] = "SEMANTIC_USE_FOREGROUND";
    MetadataConsts[MetadataConsts["SEMANTIC_USE_BACKGROUND"] = 32] = "SEMANTIC_USE_BACKGROUND";
    MetadataConsts[MetadataConsts["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
    MetadataConsts[MetadataConsts["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
    MetadataConsts[MetadataConsts["BALANCED_BRACKETS_OFFSET"] = 10] = "BALANCED_BRACKETS_OFFSET";
    MetadataConsts[MetadataConsts["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
    MetadataConsts[MetadataConsts["FOREGROUND_OFFSET"] = 15] = "FOREGROUND_OFFSET";
    MetadataConsts[MetadataConsts["BACKGROUND_OFFSET"] = 24] = "BACKGROUND_OFFSET";
})(MetadataConsts || (MetadataConsts = {}));
class TokenMetadata {
    static getLanguageId(metadata) {
        return (metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET;
    }
    static getTokenType(metadata) {
        return (metadata & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET;
    }
    static containsBalancedBrackets(metadata) {
        return (metadata & MetadataConsts.BALANCED_BRACKETS_MASK) !== 0;
    }
    static getFontStyle(metadata) {
        return (metadata & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET;
    }
    static getForeground(metadata) {
        return (metadata & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET;
    }
    static getBackground(metadata) {
        return (metadata & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET;
    }
    static getClassNameFromMetadata(metadata) {
        const foreground = this.getForeground(metadata);
        let className = 'mtk' + foreground;
        const fontStyle = this.getFontStyle(metadata);
        if (fontStyle & FontStyle.Italic) {
            className += ' mtki';
        }
        if (fontStyle & FontStyle.Bold) {
            className += ' mtkb';
        }
        if (fontStyle & FontStyle.Underline) {
            className += ' mtku';
        }
        if (fontStyle & FontStyle.Strikethrough) {
            className += ' mtks';
        }
        return className;
    }
    static getInlineStyleFromMetadata(metadata, colorMap) {
        const foreground = this.getForeground(metadata);
        const fontStyle = this.getFontStyle(metadata);
        let result = `color: ${colorMap[foreground]};`;
        if (fontStyle & FontStyle.Italic) {
            result += 'font-style: italic;';
        }
        if (fontStyle & FontStyle.Bold) {
            result += 'font-weight: bold;';
        }
        let textDecoration = '';
        if (fontStyle & FontStyle.Underline) {
            textDecoration += ' underline';
        }
        if (fontStyle & FontStyle.Strikethrough) {
            textDecoration += ' line-through';
        }
        if (textDecoration) {
            result += `text-decoration:${textDecoration};`;
        }
        return result;
    }
    static getPresentationFromMetadata(metadata) {
        const foreground = this.getForeground(metadata);
        const fontStyle = this.getFontStyle(metadata);
        return {
            foreground: foreground,
            italic: Boolean(fontStyle & FontStyle.Italic),
            bold: Boolean(fontStyle & FontStyle.Bold),
            underline: Boolean(fontStyle & FontStyle.Underline),
            strikethrough: Boolean(fontStyle & FontStyle.Strikethrough),
        };
    }
}

export { ColorId, FontStyle, LanguageId, MetadataConsts, StandardTokenType, TokenMetadata };
