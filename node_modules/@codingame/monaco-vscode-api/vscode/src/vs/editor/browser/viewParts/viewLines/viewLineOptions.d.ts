import type { ColorScheme } from "../../../../platform/theme/common/theme.js";
import type { IEditorConfiguration } from "../../../common/config/editorConfiguration.js";
export declare class ViewLineOptions {
    readonly themeType: ColorScheme;
    readonly renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
    readonly experimentalWhitespaceRendering: "svg" | "font" | "off";
    readonly renderControlCharacters: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly useMonospaceOptimizations: boolean;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly lineHeight: number;
    readonly stopRenderingLineAfter: number;
    readonly fontLigatures: string;
    readonly verticalScrollbarSize: number;
    readonly useGpu: boolean;
    constructor(config: IEditorConfiguration, themeType: ColorScheme);
    equals(other: ViewLineOptions): boolean;
}
