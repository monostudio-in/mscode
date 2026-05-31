import { MarkdownRenderOptions, IRenderedMarkdown } from "../../../base/browser/markdownRenderer.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IMarkdownRenderer, IMarkdownRendererExtraOptions, IMarkdownCodeBlockRenderer } from "./markdownRenderer.js";
export declare const IMarkdownRendererService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMarkdownRendererService>;
/**
* Service that renders markdown content in a standard manner.
*
* Unlike the lower-level {@linkcode renderMarkdown} function, this includes built-in support for features such as syntax
* highlighting of code blocks and link handling.
*
* This service should be preferred for rendering markdown in most cases.
*/
export interface IMarkdownRendererService extends IMarkdownRenderer {
    readonly _serviceBrand: undefined;
    render(markdown: IMarkdownString, options?: MarkdownRenderOptions & IMarkdownRendererExtraOptions, outElement?: HTMLElement): IRenderedMarkdown;
    setDefaultCodeBlockRenderer(renderer: IMarkdownCodeBlockRenderer): void;
}
