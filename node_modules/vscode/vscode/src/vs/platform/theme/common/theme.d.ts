/**
 * Color scheme used by the OS and by color themes.
 */
export declare enum ColorScheme {
    DARK = "dark",
    LIGHT = "light",
    HIGH_CONTRAST_DARK = "hcDark",
    HIGH_CONTRAST_LIGHT = "hcLight"
}
export declare enum ThemeTypeSelector {
    VS = "vs",
    VS_DARK = "vs-dark",
    HC_BLACK = "hc-black",
    HC_LIGHT = "hc-light"
}
export declare function isHighContrast(scheme: ColorScheme): boolean;
export declare function isDark(scheme: ColorScheme): boolean;
