
import { registerCss } from '../../../../../../../../css.js';
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { createElement, isHTMLElement } from '../../../../../base/browser/dom.js';
import { createTrustedTypesPolicy } from '../../../../../base/browser/trustedTypes.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.service.js';
import { EditorOption } from '../../../../common/config/editorOptions.js';
import { createBareFontInfoFromRawSettings } from '../../../../common/config/fontInfoFromSettings.js';
import { ILanguageService } from '../../../../common/languages/language.service.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../common/languages/modesRegistry.js';
import { tokenizeToString } from '../../../../common/languages/textToHtmlTokenizer.js';
import { applyFontInfo } from '../../../config/domFontInfo.js';
import { isCodeEditor } from '../../../editorBrowser.js';
import * as renderedMarkdown from './renderedMarkdown.css';

var EditorMarkdownCodeBlockRenderer_1;
registerCss(renderedMarkdown);
let EditorMarkdownCodeBlockRenderer = class EditorMarkdownCodeBlockRenderer {
    static {
        EditorMarkdownCodeBlockRenderer_1 = this;
    }
    static {
        this._ttpTokenizer = createTrustedTypesPolicy("tokenizeToString", {
            createHTML(html) {
                return html;
            }
        });
    }
    constructor(_configurationService, _languageService) {
        this._configurationService = _configurationService;
        this._languageService = _languageService;
    }
    async renderCodeBlock(languageAlias, value, options) {
        const editor = isCodeEditor(options.context) ? options.context : undefined;
        let languageId;
        if (languageAlias) {
            languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
        } else if (editor) {
            languageId = editor.getModel()?.getLanguageId();
        }
        if (!languageId) {
            languageId = PLAINTEXT_LANGUAGE_ID;
        }
        const html = await tokenizeToString(this._languageService, value, languageId);
        const content = EditorMarkdownCodeBlockRenderer_1._ttpTokenizer ? EditorMarkdownCodeBlockRenderer_1._ttpTokenizer.createHTML(html) ?? html : html;
        const root = createElement("span");
        root.innerHTML = content;
        const codeElement = root.querySelector(".monaco-tokenized-source");
        if (!isHTMLElement(codeElement)) {
            return createElement("span");
        }
        applyFontInfo(codeElement, this.getFontInfo(editor));
        return root;
    }
    getFontInfo(editor) {
        if (editor) {
            return editor.getOption(EditorOption.fontInfo);
        } else {
            return createBareFontInfoFromRawSettings({
                fontFamily: this._configurationService.getValue("editor").fontFamily
            }, 1);
        }
    }
};
EditorMarkdownCodeBlockRenderer = EditorMarkdownCodeBlockRenderer_1 = ( __decorate([( __param(0, IConfigurationService)), ( __param(1, ILanguageService))], EditorMarkdownCodeBlockRenderer));

export { EditorMarkdownCodeBlockRenderer };
