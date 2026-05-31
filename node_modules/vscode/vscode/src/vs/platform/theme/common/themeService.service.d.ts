import { Event } from "../../../base/common/event.js";
import { IColorTheme, IFileIconTheme, IProductIconTheme } from "./themeService.js";
export declare const IThemeService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IThemeService>;
export interface IThemeService {
    readonly _serviceBrand: undefined;
    getColorTheme(): IColorTheme;
    readonly onDidColorThemeChange: Event<IColorTheme>;
    getFileIconTheme(): IFileIconTheme;
    readonly onDidFileIconThemeChange: Event<IFileIconTheme>;
    getProductIconTheme(): IProductIconTheme;
    readonly onDidProductIconThemeChange: Event<IProductIconTheme>;
}
