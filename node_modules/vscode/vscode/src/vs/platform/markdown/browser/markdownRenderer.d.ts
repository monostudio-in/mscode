import { IRenderedMarkdown, MarkdownRenderOptions } from "../../../base/browser/markdownRenderer.js";
import { IMarkdownString, MarkdownStringTrustedOptions } from "../../../base/common/htmlContent.js";
import { IOpenerService } from "../../opener/common/opener.service.js";
import { IMarkdownRendererService } from "./markdownRenderer.service.js";
/**
 * Renders markdown to HTML.
 *
 * This interface allows a upper level component to pass a custom markdown renderer to sub-components.
 *
 * If you want to render markdown content in a standard way, prefer using the {@linkcode IMarkdownRendererService}.
 */
export interface IMarkdownRenderer {
    render(markdown: IMarkdownString, options?: MarkdownRenderOptions, outElement?: HTMLElement): IRenderedMarkdown;
}
export interface IMarkdownRendererExtraOptions {
    /**
     * The context in which the markdown is being rendered.
     */
    readonly context?: unknown;
}
export interface IMarkdownCodeBlockRenderer {
    renderCodeBlock(languageAlias: string | undefined, value: string, options: IMarkdownRendererExtraOptions): Promise<HTMLElement>;
}
export declare class MarkdownRendererService implements IMarkdownRendererService {
    private readonly _openerService;
    readonly _serviceBrand: undefined;
    private _defaultCodeBlockRenderer;
    constructor(_openerService: IOpenerService);
    render(markdown: IMarkdownString, options?: MarkdownRenderOptions & IMarkdownRendererExtraOptions, outElement?: HTMLElement): IRenderedMarkdown;
    setDefaultCodeBlockRenderer(renderer: IMarkdownCodeBlockRenderer): void;
}
export declare function openLinkFromMarkdown(openerService: IOpenerService, link: string, isTrusted: boolean | MarkdownStringTrustedOptions | undefined, skipValidation?: boolean): Promise<boolean>;
