import { Color } from "../../../base/common/color.js";
import { IThemeService } from "../../../platform/theme/common/themeService.service.js";
import { IStandaloneThemeData, IStandaloneTheme } from "./standaloneTheme.js";
export declare const IStandaloneThemeService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IStandaloneThemeService>;
export interface IStandaloneThemeService extends IThemeService {
    readonly _serviceBrand: undefined;
    setTheme(themeName: string): void;
    setAutoDetectHighContrast(autoDetectHighContrast: boolean): void;
    defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
    getColorTheme(): IStandaloneTheme;
    setColorMapOverride(colorMapOverride: Color[] | null): void;
}
