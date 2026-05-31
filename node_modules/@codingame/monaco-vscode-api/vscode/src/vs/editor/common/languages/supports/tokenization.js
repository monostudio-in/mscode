
import { Color } from '../../../../base/common/color.js';
import { FontStyle, MetadataConsts, StandardTokenType, ColorId } from '../../encodedTokenAttributes.js';

class ParsedTokenThemeRule {
    constructor(token, index, fontStyle, foreground, background) {
        this._parsedThemeRuleBrand = undefined;
        this.token = token;
        this.index = index;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
}
function parseTokenTheme(source) {
    if (!source || !Array.isArray(source)) {
        return [];
    }
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = source.length; i < len; i++) {
        const entry = source[i];
        let fontStyle = FontStyle.NotSet;
        if (typeof entry.fontStyle === "string") {
            fontStyle = FontStyle.None;
            const segments = entry.fontStyle.split(" ");
            for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                const segment = segments[j];
                switch (segment) {
                case "italic":
                    fontStyle = fontStyle | FontStyle.Italic;
                    break;
                case "bold":
                    fontStyle = fontStyle | FontStyle.Bold;
                    break;
                case "underline":
                    fontStyle = fontStyle | FontStyle.Underline;
                    break;
                case "strikethrough":
                    fontStyle = fontStyle | FontStyle.Strikethrough;
                    break;
                }
            }
        }
        let foreground = null;
        if (typeof entry.foreground === "string") {
            foreground = entry.foreground;
        }
        let background = null;
        if (typeof entry.background === "string") {
            background = entry.background;
        }
        result[resultLen++] = ( new ParsedTokenThemeRule(entry.token || "", i, fontStyle, foreground, background));
    }
    return result;
}
function resolveParsedTokenThemeRules(parsedThemeRules, customTokenColors) {
    parsedThemeRules.sort((a, b) => {
        const r = strcmp(a.token, b.token);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    let defaultFontStyle = FontStyle.None;
    let defaultForeground = "000000";
    let defaultBackground = "ffffff";
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === "") {
        const incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== FontStyle.NotSet) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    const colorMap = ( new ColorMap());
    for (const color of customTokenColors) {
        colorMap.getId(color);
    }
    const foregroundColorId = colorMap.getId(defaultForeground);
    const backgroundColorId = colorMap.getId(defaultBackground);
    const defaults = ( new ThemeTrieElementRule(defaultFontStyle, foregroundColorId, backgroundColorId));
    const root = ( new ThemeTrieElement(defaults));
    for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
        const rule = parsedThemeRules[i];
        root.insert(
            rule.token,
            rule.fontStyle,
            colorMap.getId(rule.foreground),
            colorMap.getId(rule.background)
        );
    }
    return ( new TokenTheme(colorMap, root));
}
const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
class ColorMap {
    constructor() {
        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = ( new Map());
    }
    getId(color) {
        if (color === null) {
            return 0;
        }
        const match = color.match(colorRegExp);
        if (!match) {
            throw ( new Error("Illegal value for token color: " + color));
        }
        color = match[1].toUpperCase();
        let value = this._color2id.get(color);
        if (value) {
            return value;
        }
        value = ++this._lastColorId;
        this._color2id.set(color, value);
        this._id2color[value] = ( Color.fromHex("#" + color));
        return value;
    }
    getColorMap() {
        return this._id2color.slice(0);
    }
}
class TokenTheme {
    static createFromRawTokenTheme(source, customTokenColors) {
        return this.createFromParsedTokenTheme(parseTokenTheme(source), customTokenColors);
    }
    static createFromParsedTokenTheme(source, customTokenColors) {
        return resolveParsedTokenThemeRules(source, customTokenColors);
    }
    constructor(colorMap, root) {
        this._colorMap = colorMap;
        this._root = root;
        this._cache = ( new Map());
    }
    getColorMap() {
        return this._colorMap.getColorMap();
    }
    getThemeTrieElement() {
        return this._root.toExternalThemeTrieElement();
    }
    _match(token) {
        return this._root.match(token);
    }
    match(languageId, token) {
        let result = this._cache.get(token);
        if (typeof result === "undefined") {
            const rule = this._match(token);
            const standardToken = toStandardTokenType(token);
            result = (rule.metadata | (standardToken << MetadataConsts.TOKEN_TYPE_OFFSET)) >>> 0;
            this._cache.set(token, result);
        }
        return (result | (languageId << MetadataConsts.LANGUAGEID_OFFSET)) >>> 0;
    }
}
const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;
function toStandardTokenType(tokenType) {
    const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
    if (!m) {
        return StandardTokenType.Other;
    }
    switch (m[1]) {
    case "comment":
        return StandardTokenType.Comment;
    case "string":
        return StandardTokenType.String;
    case "regex":
        return StandardTokenType.RegEx;
    case "regexp":
        return StandardTokenType.RegEx;
    }
    throw ( new Error("Unexpected match for standard token type!"));
}
function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
class ThemeTrieElementRule {
    constructor(fontStyle, foreground, background) {
        this._themeTrieElementRuleBrand = undefined;
        this._fontStyle = fontStyle;
        this._foreground = foreground;
        this._background = background;
        this.metadata = ((this._fontStyle << MetadataConsts.FONT_STYLE_OFFSET) | (this._foreground << MetadataConsts.FOREGROUND_OFFSET) | (this._background << MetadataConsts.BACKGROUND_OFFSET)) >>> 0;
    }
    clone() {
        return ( new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background));
    }
    acceptOverwrite(fontStyle, foreground, background) {
        if (fontStyle !== FontStyle.NotSet) {
            this._fontStyle = fontStyle;
        }
        if (foreground !== ColorId.None) {
            this._foreground = foreground;
        }
        if (background !== ColorId.None) {
            this._background = background;
        }
        this.metadata = ((this._fontStyle << MetadataConsts.FONT_STYLE_OFFSET) | (this._foreground << MetadataConsts.FOREGROUND_OFFSET) | (this._background << MetadataConsts.BACKGROUND_OFFSET)) >>> 0;
    }
}
class ExternalThemeTrieElement {
    constructor(
        mainRule,
        children = ( new Map())
    ) {
        this.mainRule = mainRule;
        if (children instanceof Map) {
            this.children = children;
        } else {
            this.children = ( new Map());
            for (const key in children) {
                this.children.set(key, children[key]);
            }
        }
    }
}
class ThemeTrieElement {
    constructor(mainRule) {
        this._themeTrieElementBrand = undefined;
        this._mainRule = mainRule;
        this._children = ( new Map());
    }
    toExternalThemeTrieElement() {
        const children = ( new Map());
        this._children.forEach((element, index) => {
            children.set(index, element.toExternalThemeTrieElement());
        });
        return ( new ExternalThemeTrieElement(this._mainRule, children));
    }
    match(token) {
        if (token === "") {
            return this._mainRule;
        }
        const dotIndex = token.indexOf(".");
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = "";
        } else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        const child = this._children.get(head);
        if (typeof child !== "undefined") {
            return child.match(tail);
        }
        return this._mainRule;
    }
    insert(token, fontStyle, foreground, background) {
        if (token === "") {
            this._mainRule.acceptOverwrite(fontStyle, foreground, background);
            return;
        }
        const dotIndex = token.indexOf(".");
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = "";
        } else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        let child = this._children.get(head);
        if (typeof child === "undefined") {
            child = ( new ThemeTrieElement(this._mainRule.clone()));
            this._children.set(head, child);
        }
        child.insert(tail, fontStyle, foreground, background);
    }
}
function generateTokensCSSForColorMap(colorMap) {
    const rules = [];
    for (let i = 1, len = colorMap.length; i < len; i++) {
        const color = colorMap[i];
        rules[i] = `.mtk${i} { color: ${color}; }`;
    }
    rules.push(".mtki { font-style: italic; }");
    rules.push(".mtkb { font-weight: bold; }");
    rules.push(".mtku { text-decoration: underline; text-underline-position: under; }");
    rules.push(".mtks { text-decoration: line-through; }");
    rules.push(
        ".mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }"
    );
    return rules.join("\n");
}
function generateTokensCSSForFontMap(fontMap) {
    const rules = [];
    const fonts = ( new Set());
    for (let i = 1, len = fontMap.length; i < len; i++) {
        const font = fontMap[i];
        if (!font.fontFamily && !font.fontSizeMultiplier) {
            continue;
        }
        const className = classNameForFontTokenDecorations(font.fontFamily ?? "", font.fontSizeMultiplier ?? 0);
        if (( fonts.has(className))) {
            continue;
        }
        fonts.add(className);
        let rule = `.${className} {`;
        if (font.fontFamily) {
            rule += `font-family: ${font.fontFamily};`;
        }
        if (font.fontSizeMultiplier) {
            rule += `font-size: calc(var(--editor-font-size)*${font.fontSizeMultiplier});`;
        }
        rule += `}`;
        rules.push(rule);
    }
    return rules.join("\n");
}
function classNameForFontTokenDecorations(fontFamily, fontSize) {
    const safeFontFamily = sanitizeFontFamilyForClassName(fontFamily);
    return cleanClassName(`font-decoration-${safeFontFamily}-${fontSize}`);
}
function sanitizeFontFamilyForClassName(fontFamily) {
    const normalized = fontFamily.toLowerCase().trim();
    if (!normalized) {
        return "default";
    }
    return cleanClassName(normalized);
}
function cleanClassName(className) {
    return className.replace(/[^a-z0-9_-]/gi, "-");
}

export { ColorMap, ExternalThemeTrieElement, ParsedTokenThemeRule, ThemeTrieElement, ThemeTrieElementRule, TokenTheme, classNameForFontTokenDecorations, generateTokensCSSForColorMap, generateTokensCSSForFontMap, parseTokenTheme, strcmp, toStandardTokenType };
