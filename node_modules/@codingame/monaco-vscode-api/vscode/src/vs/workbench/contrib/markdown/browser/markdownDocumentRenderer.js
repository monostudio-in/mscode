
import { sanitizeHtml } from '../../../../base/browser/domSanitize.js';
import { allowedMarkdownHtmlAttributes, allowedMarkdownHtmlTags } from '../../../../base/browser/markdownRenderer.js';
import { raceCancellationError } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Marked } from 'marked';
import { Schemas } from '../../../../base/common/network.js';
import { escape } from '../../../../base/common/strings.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { markedGfmHeadingIdPlugin } from './markedGfmHeadingIdPlugin.js';

const DEFAULT_MARKDOWN_STYLES = `
body {
    padding: 10px 20px;
    line-height: 22px;
    max-width: 882px;
    margin: 0 auto;
}

body *:last-child {
    margin-bottom: 0;
}

img {
    max-width: 100%;
    max-height: 100%;
}

a {
    text-decoration: var(--text-link-decoration);
}

a:hover {
    text-decoration: underline;
}

a:focus,
input:focus,
select:focus,
textarea:focus {
    outline: 1px solid -webkit-focus-ring-color;
    outline-offset: -1px;
}

hr {
    border: 0;
    height: 2px;
    border-bottom: 2px solid;
}

h1 {
    padding-bottom: 0.3em;
    line-height: 1.2;
    border-bottom-width: 1px;
    border-bottom-style: solid;
}

h1, h2, h3 {
    font-weight: normal;
}

table {
    border-collapse: collapse;
}

th {
    text-align: left;
    border-bottom: 1px solid;
}

th,
td {
    padding: 5px 10px;
}

table > tbody > tr + tr > td {
    border-top-width: 1px;
    border-top-style: solid;
}

blockquote {
    margin: 0 7px 0 5px;
    padding: 0 16px 0 10px;
    border-left-width: 5px;
    border-left-style: solid;
}

code {
    font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
}

pre {
    padding: 16px;
    border-radius: 3px;
    overflow: auto;
}

pre code {
    font-family: var(--vscode-editor-font-family);
    font-weight: var(--vscode-editor-font-weight);
    font-size: var(--vscode-editor-font-size);
    line-height: 1.5;
    color: var(--vscode-editor-foreground);
    tab-size: 4;
}

.monaco-tokenized-source {
    white-space: pre;
}

/** Theming */

.pre {
    background-color: var(--vscode-textCodeBlock-background);
}

.vscode-high-contrast h1 {
    border-color: rgb(0, 0, 0);
}

.vscode-light th {
    border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark th {
    border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light h1,
.vscode-light hr,
.vscode-light td {
    border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark h1,
.vscode-dark hr,
.vscode-dark td {
    border-color: rgba(255, 255, 255, 0.18);
}

@media (forced-colors: active) and (prefers-color-scheme: light){
    body {
        forced-color-adjust: none;
    }
}

@media (forced-colors: active) and (prefers-color-scheme: dark){
    body {
        forced-color-adjust: none;
    }
}
`;
const defaultAllowedLinkProtocols = ( Object.freeze([Schemas.http, Schemas.https]));
function sanitize(documentContent, sanitizerConfig) {
    return sanitizeHtml(documentContent, {
        allowedLinkProtocols: {
            override: sanitizerConfig?.allowedLinkProtocols?.override ?? defaultAllowedLinkProtocols
        },
        allowRelativeLinkPaths: sanitizerConfig?.allowRelativeLinkPaths,
        allowedMediaProtocols: sanitizerConfig?.allowedMediaProtocols,
        allowRelativeMediaPaths: sanitizerConfig?.allowRelativeMediaPaths,
        allowedTags: {
            override: allowedMarkdownHtmlTags,
            augment: sanitizerConfig?.allowedTags?.augment
        },
        allowedAttributes: {
            override: [
                ...allowedMarkdownHtmlAttributes,
                "name",
                "id",
                "class",
                "role",
                "tabindex",
                "placeholder"
            ],
            augment: sanitizerConfig?.allowedAttributes?.augment ?? []
        }
    });
}
async function renderMarkdownDocument(
    text,
    extensionService,
    languageService,
    options,
    token = CancellationToken.None
) {
    const m = new Marked(MarkedHighlight.markedHighlight({
        async: true,
        async highlight(code, lang) {
            if (typeof lang !== "string") {
                return escape(code);
            }
            await extensionService.whenInstalledExtensionsRegistered();
            if (token?.isCancellationRequested) {
                return "";
            }
            const languageId = languageService.getLanguageIdByLanguageName(lang) ?? languageService.getLanguageIdByLanguageName(lang.split(/\s+|:|,|(?!^)\{|\?]/, 1)[0]);
            return tokenizeToString(languageService, code, languageId);
        }
    }), markedGfmHeadingIdPlugin(), ...(options?.markedExtensions ?? []));
    const raw = await raceCancellationError(m.parse(text, {
        async: true
    }), token ?? CancellationToken.None);
    return sanitize(raw, options?.sanitizerConfig);
}
var MarkedHighlight;
(function(MarkedHighlight) {
    function markedHighlight(options) {
        if (typeof options === "function") {
            options = {
                highlight: options
            };
        }
        if (!options || typeof options.highlight !== "function") {
            throw ( new Error("Must provide highlight function"));
        }
        return {
            async: !!options.async,
            walkTokens(token) {
                if (token.type !== "code") {
                    return;
                }
                if (options.async) {
                    return Promise.resolve(options.highlight(token.text, token.lang)).then(updateToken(token));
                }
                const code = options.highlight(token.text, token.lang);
                if (code instanceof Promise) {
                    throw ( new Error(
                        "markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function."
                    ));
                }
                updateToken(token)(code);
            },
            renderer: {
                code(
                    {
                        text,
                        lang,
                        escaped
                    }
                ) {
                    const classAttr = lang ? ` class="language-${escape(lang)}"` : "";
                    text = text.replace(/\n$/, "");
                    return `<pre><code${classAttr}>${escaped ? text : escape(text, true)}\n</code></pre>`;
                }
            }
        };
    }
    MarkedHighlight.markedHighlight = markedHighlight;
    function updateToken(token) {
        return code => {
            if (typeof code === "string" && code !== token.text) {
                token.escaped = true;
                token.text = code;
            }
        };
    }
    const escapeTest = /[&<>"']/;
    const escapeReplace = ( new RegExp(escapeTest.source, "g"));
    const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
    const escapeReplaceNoEncode = ( new RegExp(escapeTestNoEncode.source, "g"));
    const escapeReplacement = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        [`'`]: "&#39;"
    };
    const getEscapeReplacement = ch => escapeReplacement[ch];
    function escape(html, encode) {
        if (encode) {
            if (escapeTest.test(html)) {
                return html.replace(escapeReplace, getEscapeReplacement);
            }
        } else {
            if (escapeTestNoEncode.test(html)) {
                return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
            }
        }
        return html;
    }
})(MarkedHighlight || (MarkedHighlight = {}));

export { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument };
