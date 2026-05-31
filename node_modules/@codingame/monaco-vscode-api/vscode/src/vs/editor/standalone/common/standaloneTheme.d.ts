import { ITokenThemeRule, TokenTheme } from "../../common/languages/supports/tokenization.js";
import { IColorTheme } from "../../../platform/theme/common/themeService.js";
export type BuiltinTheme = "vs" | "vs-dark" | "hc-black" | "hc-light";
export type IColors = {
    [colorId: string]: string;
};
export interface IStandaloneThemeData {
    base: BuiltinTheme;
    inherit: boolean;
    rules: ITokenThemeRule[];
    encodedTokensColors?: string[];
    colors: IColors;
}
export interface IStandaloneTheme extends IColorTheme {
    tokenTheme: TokenTheme;
    themeName: string;
}
