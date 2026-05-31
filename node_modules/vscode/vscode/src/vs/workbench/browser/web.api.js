

var Menu;
(function (Menu) {
    Menu[Menu["CommandPalette"] = 0] = "CommandPalette";
    Menu[Menu["StatusBarWindowIndicatorMenu"] = 1] = "StatusBarWindowIndicatorMenu";
})(Menu || (Menu = {}));
var ColorScheme;
(function (ColorScheme) {
    ColorScheme["DARK"] = "dark";
    ColorScheme["LIGHT"] = "light";
    ColorScheme["HIGH_CONTRAST_LIGHT"] = "hcLight";
    ColorScheme["HIGH_CONTRAST_DARK"] = "hcDark";
})(ColorScheme || (ColorScheme = {}));

export { ColorScheme, Menu };
