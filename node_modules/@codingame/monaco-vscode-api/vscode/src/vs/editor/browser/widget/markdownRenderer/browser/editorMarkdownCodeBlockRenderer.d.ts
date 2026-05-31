import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { IMarkdownCodeBlockRenderer, IMarkdownRendererExtraOptions } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { ILanguageService } from "../../../../common/languages/language.service.js";
/**
 * Renders markdown code blocks using the editor's tokenization and font settings.
 */
export declare class EditorMarkdownCodeBlockRenderer implements IMarkdownCodeBlockRenderer {
    private readonly _configurationService;
    private readonly _languageService;
    private static _ttpTokenizer;
    constructor(_configurationService: IConfigurationService, _languageService: ILanguageService);
    renderCodeBlock(languageAlias: string | undefined, value: string, options: IMarkdownRendererExtraOptions): Promise<HTMLElement>;
    private getFontInfo;
}
