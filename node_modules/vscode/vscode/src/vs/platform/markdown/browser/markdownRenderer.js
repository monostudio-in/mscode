
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { createElement } from '../../../base/browser/dom.js';
import { renderMarkdown } from '../../../base/browser/markdownRenderer.js';
import { onUnexpectedError } from '../../../base/common/errors.js';
import '../../instantiation/common/extensions.js';
import { IOpenerService } from '../../opener/common/opener.service.js';
import '../../instantiation/common/instantiation.js';

let MarkdownRendererService = class MarkdownRendererService {
    constructor(_openerService) {
        this._openerService = _openerService;
    }
    render(markdown, options, outElement) {
        const resolvedOptions = {
            ...options
        };
        if (!resolvedOptions.actionHandler) {
            resolvedOptions.actionHandler = (link, mdStr) => {
                return openLinkFromMarkdown(this._openerService, link, mdStr.isTrusted);
            };
        }
        if (!resolvedOptions.codeBlockRenderer) {
            resolvedOptions.codeBlockRenderer = (alias, value) => {
                return this._defaultCodeBlockRenderer?.renderCodeBlock(alias, value, resolvedOptions ?? {}) ?? Promise.resolve(createElement("span"));
            };
        }
        const rendered = renderMarkdown(markdown, resolvedOptions, outElement);
        rendered.element.classList.add("rendered-markdown");
        return rendered;
    }
    setDefaultCodeBlockRenderer(renderer) {
        this._defaultCodeBlockRenderer = renderer;
    }
};
MarkdownRendererService = ( __decorate([( __param(0, IOpenerService))], MarkdownRendererService));
async function openLinkFromMarkdown(openerService, link, isTrusted, skipValidation) {
    try {
        return await openerService.open(link, {
            fromUserGesture: true,
            allowContributedOpeners: true,
            allowCommands: toAllowCommandsOption(isTrusted),
            skipValidation
        });
    } catch (e) {
        onUnexpectedError(e);
        return false;
    }
}
function toAllowCommandsOption(isTrusted) {
    if (isTrusted === true) {
        return true;
    }
    if (isTrusted && Array.isArray(isTrusted.enabledCommands)) {
        return isTrusted.enabledCommands;
    }
    return false;
}

export { MarkdownRendererService, openLinkFromMarkdown };
