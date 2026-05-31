import { Color } from "../common/color.js";
import { URI } from "../common/uri.js";
export type CssFragment = string & {
    readonly __cssFragment: unique symbol;
};
export declare function asCssValueWithDefault(cssPropertyValue: string | undefined, dflt: string): string;
export declare function sizeValue(value: string): CssFragment;
export declare function hexColorValue(value: string): CssFragment;
export declare function identValue(value: string): CssFragment;
export declare function stringValue(value: string): CssFragment;
/**
 * returns url('...')
 */
export declare function asCSSUrl(uri: URI | null | undefined): CssFragment;
export declare function className(value: string, escapingExpected?: boolean): CssFragment;
type InlineCssTemplateValue = CssFragment | Color;
/**
 * Template string tag that that constructs a CSS fragment.
 *
 * All expressions in the template must be css safe values.
 */
export declare function inline(strings: TemplateStringsArray, ...values: InlineCssTemplateValue[]): CssFragment;
export declare class Builder {
    private readonly _parts;
    push(...parts: CssFragment[]): void;
    join(joiner?: string): CssFragment;
}
export {};
