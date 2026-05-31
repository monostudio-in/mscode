import { Disposable } from "../../../../base/common/lifecycle.js";
/**
 * Extracts CSS rules that would be applied to certain decoration classes.
 */
export declare class DecorationCssRuleExtractor extends Disposable {
    private _container;
    private _dummyElement;
    private _ruleCache;
    private _cssVariableCache;
    constructor();
    getStyleRules(canvas: HTMLElement, decorationClassName: string): CSSStyleRule[];
    private _getStyleRules;
    private _collectMatchingRules;
    /**
     * Resolves a CSS variable to its computed value using the container element.
     */
    resolveCssVariable(canvas: HTMLCanvasElement, variableName: string): string;
    /**
     * Clears all cached CSS rules and CSS variable values. This should be called when the theme
     * changes to ensure fresh values are computed.
     */
    clear(): void;
}
