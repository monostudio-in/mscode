import { Event } from "../../../../base/common/event.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IWorkbenchColorTheme, ThemeSettingTarget, IWorkbenchFileIconTheme, IWorkbenchProductIconTheme } from "./workbenchThemeService.js";
export declare const IWorkbenchThemeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchThemeService>;
export interface IWorkbenchThemeService extends IThemeService {
    readonly _serviceBrand: undefined;
    setColorTheme(themeId: string | undefined | IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme | null>;
    getColorTheme(): IWorkbenchColorTheme;
    getColorThemes(): Promise<IWorkbenchColorTheme[]>;
    getMarketplaceColorThemes(publisher: string, name: string, version: string): Promise<IWorkbenchColorTheme[]>;
    readonly onDidColorThemeChange: Event<IWorkbenchColorTheme>;
    getPreferredColorScheme(): ColorScheme | undefined;
    setFileIconTheme(iconThemeId: string | undefined | IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
    getFileIconTheme(): IWorkbenchFileIconTheme;
    getFileIconThemes(): Promise<IWorkbenchFileIconTheme[]>;
    getMarketplaceFileIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchFileIconTheme[]>;
    readonly onDidFileIconThemeChange: Event<IWorkbenchFileIconTheme>;
    setProductIconTheme(iconThemeId: string | undefined | IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
    getProductIconTheme(): IWorkbenchProductIconTheme;
    getProductIconThemes(): Promise<IWorkbenchProductIconTheme[]>;
    getMarketplaceProductIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchProductIconTheme[]>;
    readonly onDidProductIconThemeChange: Event<IWorkbenchProductIconTheme>;
}
