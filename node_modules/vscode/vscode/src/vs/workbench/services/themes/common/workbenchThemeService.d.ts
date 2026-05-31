import { Color } from "../../../../base/common/color.js";
import { IColorTheme, IFileIconTheme, IProductIconTheme } from "../../../../platform/theme/common/themeService.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IconContribution, IconDefinition } from "../../../../platform/theme/common/iconRegistry.js";
import { ThemeTypeSelector } from "../../../../platform/theme/common/theme.js";
export declare const THEME_SCOPE_OPEN_PAREN = "[";
export declare const THEME_SCOPE_CLOSE_PAREN = "]";
export declare const THEME_SCOPE_WILDCARD = "*";
export declare const themeScopeRegex: RegExp;
export declare enum ThemeSettings {
    COLOR_THEME = "workbench.colorTheme",
    FILE_ICON_THEME = "workbench.iconTheme",
    PRODUCT_ICON_THEME = "workbench.productIconTheme",
    COLOR_CUSTOMIZATIONS = "workbench.colorCustomizations",
    TOKEN_COLOR_CUSTOMIZATIONS = "editor.tokenColorCustomizations",
    SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS = "editor.semanticTokenColorCustomizations",
    PREFERRED_DARK_THEME = "workbench.preferredDarkColorTheme",
    PREFERRED_LIGHT_THEME = "workbench.preferredLightColorTheme",
    PREFERRED_HC_DARK_THEME = "workbench.preferredHighContrastColorTheme",/* id kept for compatibility reasons */
    PREFERRED_HC_LIGHT_THEME = "workbench.preferredHighContrastLightColorTheme",
    DETECT_COLOR_SCHEME = "window.autoDetectColorScheme",
    DETECT_HC = "window.autoDetectHighContrast",
    SYSTEM_COLOR_THEME = "window.systemColorTheme"
}
export declare namespace ThemeSettingDefaults {
    const COLOR_THEME_DARK = "Dark 2026";
    const COLOR_THEME_LIGHT = "Light 2026";
    const COLOR_THEME_HC_DARK = "Default High Contrast";
    const COLOR_THEME_HC_LIGHT = "Default High Contrast Light";
    const FILE_ICON_THEME = "vs-seti";
    const PRODUCT_ICON_THEME = "Default";
}
/**
 * Migrates legacy theme settings IDs to their current equivalents.
 * Theme IDs were simplified: "Default" prefix was removed from built-in themes,
 * and "Experimental" prefix was replaced when VS Code themes became GA.
 */
export declare function migrateThemeSettingsId(settingsId: string): string;
export declare const COLOR_THEME_DARK_INITIAL_COLORS: {
    "actionBar.toggledBackground": string;
    "activityBar.activeBorder": string;
    "activityBar.background": string;
    "activityBar.border": string;
    "activityBar.foreground": string;
    "activityBar.inactiveForeground": string;
    "activityBarBadge.background": string;
    "activityBarBadge.foreground": string;
    "badge.background": string;
    "badge.foreground": string;
    "button.background": string;
    "button.border": string;
    "button.foreground": string;
    "button.hoverBackground": string;
    "button.secondaryBackground": string;
    "button.secondaryForeground": string;
    "button.secondaryHoverBackground": string;
    "chat.slashCommandBackground": string;
    "chat.slashCommandForeground": string;
    "chat.editedFileForeground": string;
    "checkbox.background": string;
    "checkbox.border": string;
    "debugToolBar.background": string;
    descriptionForeground: string;
    "dropdown.background": string;
    "dropdown.border": string;
    "dropdown.foreground": string;
    "dropdown.listBackground": string;
    "editor.background": string;
    "editor.findMatchBackground": string;
    "editor.foreground": string;
    "editor.inactiveSelectionBackground": string;
    "editor.selectionHighlightBackground": string;
    "editorGroup.border": string;
    "editorGroupHeader.tabsBackground": string;
    "editorGroupHeader.tabsBorder": string;
    "editorGutter.addedBackground": string;
    "editorGutter.deletedBackground": string;
    "editorGutter.modifiedBackground": string;
    "editorIndentGuide.activeBackground1": string;
    "editorIndentGuide.background1": string;
    "editorLineNumber.activeForeground": string;
    "editorLineNumber.foreground": string;
    "editorOverviewRuler.border": string;
    "editorWidget.background": string;
    errorForeground: string;
    focusBorder: string;
    foreground: string;
    "icon.foreground": string;
    "input.background": string;
    "input.border": string;
    "input.foreground": string;
    "input.placeholderForeground": string;
    "inputOption.activeBackground": string;
    "inputOption.activeBorder": string;
    "keybindingLabel.foreground": string;
    "list.activeSelectionIconForeground": string;
    "list.dropBackground": string;
    "menu.background": string;
    "menu.border": string;
    "menu.foreground": string;
    "menu.selectionBackground": string;
    "menu.separatorBackground": string;
    "notificationCenterHeader.background": string;
    "notificationCenterHeader.foreground": string;
    "notifications.background": string;
    "notifications.border": string;
    "notifications.foreground": string;
    "panel.background": string;
    "panel.border": string;
    "panelInput.border": string;
    "panelTitle.activeBorder": string;
    "panelTitle.activeForeground": string;
    "panelTitle.inactiveForeground": string;
    "peekViewEditor.background": string;
    "peekViewEditor.matchHighlightBackground": string;
    "peekViewResult.background": string;
    "peekViewResult.matchHighlightBackground": string;
    "pickerGroup.border": string;
    "ports.iconRunningProcessForeground": string;
    "progressBar.background": string;
    "quickInput.background": string;
    "quickInput.foreground": string;
    "settings.dropdownBackground": string;
    "settings.dropdownBorder": string;
    "settings.headerForeground": string;
    "settings.modifiedItemIndicator": string;
    "sideBar.background": string;
    "sideBar.border": string;
    "sideBar.foreground": string;
    "sideBarSectionHeader.background": string;
    "sideBarSectionHeader.border": string;
    "sideBarSectionHeader.foreground": string;
    "sideBarTitle.foreground": string;
    "statusBar.background": string;
    "statusBar.border": string;
    "statusBar.debuggingBackground": string;
    "statusBar.debuggingForeground": string;
    "statusBar.focusBorder": string;
    "statusBar.foreground": string;
    "statusBar.noFolderBackground": string;
    "statusBarItem.focusBorder": string;
    "statusBarItem.prominentBackground": string;
    "statusBarItem.remoteBackground": string;
    "statusBarItem.remoteForeground": string;
    "tab.activeBackground": string;
    "tab.activeBorder": string;
    "tab.activeBorderTop": string;
    "tab.activeForeground": string;
    "tab.border": string;
    "tab.hoverBackground": string;
    "tab.inactiveBackground": string;
    "tab.inactiveForeground": string;
    "tab.lastPinnedBorder": string;
    "tab.selectedBackground": string;
    "tab.selectedBorderTop": string;
    "tab.selectedForeground": string;
    "tab.unfocusedActiveBorder": string;
    "tab.unfocusedActiveBorderTop": string;
    "tab.unfocusedHoverBackground": string;
    "terminal.foreground": string;
    "terminal.inactiveSelectionBackground": string;
    "terminal.tab.activeBorder": string;
    "textBlockQuote.background": string;
    "textBlockQuote.border": string;
    "textCodeBlock.background": string;
    "textLink.activeForeground": string;
    "textLink.foreground": string;
    "textPreformat.background": string;
    "textPreformat.foreground": string;
    "textSeparator.foreground": string;
    "titleBar.activeBackground": string;
    "titleBar.activeForeground": string;
    "titleBar.border": string;
    "titleBar.inactiveBackground": string;
    "titleBar.inactiveForeground": string;
    "welcomePage.progress.foreground": string;
    "welcomePage.tileBackground": string;
    "widget.border": string;
};
export declare const COLOR_THEME_LIGHT_INITIAL_COLORS: {
    "actionBar.toggledBackground": string;
    "activityBar.activeBorder": string;
    "activityBar.background": string;
    "activityBar.border": string;
    "activityBar.foreground": string;
    "activityBar.inactiveForeground": string;
    "activityBarBadge.background": string;
    "activityBarBadge.foreground": string;
    "badge.background": string;
    "badge.foreground": string;
    "button.background": string;
    "button.border": string;
    "button.foreground": string;
    "button.hoverBackground": string;
    "button.secondaryBackground": string;
    "button.secondaryForeground": string;
    "button.secondaryHoverBackground": string;
    "chat.slashCommandBackground": string;
    "chat.slashCommandForeground": string;
    "chat.editedFileForeground": string;
    "checkbox.background": string;
    "checkbox.border": string;
    descriptionForeground: string;
    "diffEditor.unchangedRegionBackground": string;
    "dropdown.background": string;
    "dropdown.border": string;
    "dropdown.foreground": string;
    "dropdown.listBackground": string;
    "editor.background": string;
    "editor.foreground": string;
    "editor.inactiveSelectionBackground": string;
    "editor.selectionHighlightBackground": string;
    "editorGroup.border": string;
    "editorGroupHeader.tabsBackground": string;
    "editorGroupHeader.tabsBorder": string;
    "editorGutter.addedBackground": string;
    "editorGutter.deletedBackground": string;
    "editorGutter.modifiedBackground": string;
    "editorIndentGuide.activeBackground1": string;
    "editorIndentGuide.background1": string;
    "editorLineNumber.activeForeground": string;
    "editorLineNumber.foreground": string;
    "editorOverviewRuler.border": string;
    "editorSuggestWidget.background": string;
    "editorWidget.background": string;
    errorForeground: string;
    focusBorder: string;
    foreground: string;
    "icon.foreground": string;
    "input.background": string;
    "input.border": string;
    "input.foreground": string;
    "input.placeholderForeground": string;
    "inputOption.activeBackground": string;
    "inputOption.activeBorder": string;
    "inputOption.activeForeground": string;
    "keybindingLabel.foreground": string;
    "list.activeSelectionBackground": string;
    "list.activeSelectionForeground": string;
    "list.activeSelectionIconForeground": string;
    "list.focusAndSelectionOutline": string;
    "list.hoverBackground": string;
    "menu.border": string;
    "menu.selectionBackground": string;
    "menu.selectionForeground": string;
    "notebook.cellBorderColor": string;
    "notebook.selectedCellBackground": string;
    "notificationCenterHeader.background": string;
    "notificationCenterHeader.foreground": string;
    "notifications.background": string;
    "notifications.border": string;
    "notifications.foreground": string;
    "panel.background": string;
    "panel.border": string;
    "panelInput.border": string;
    "panelTitle.activeBorder": string;
    "panelTitle.activeForeground": string;
    "panelTitle.inactiveForeground": string;
    "peekViewEditor.matchHighlightBackground": string;
    "peekViewResult.background": string;
    "peekViewResult.matchHighlightBackground": string;
    "pickerGroup.border": string;
    "pickerGroup.foreground": string;
    "ports.iconRunningProcessForeground": string;
    "progressBar.background": string;
    "quickInput.background": string;
    "quickInput.foreground": string;
    "searchEditor.textInputBorder": string;
    "settings.dropdownBackground": string;
    "settings.dropdownBorder": string;
    "settings.headerForeground": string;
    "settings.modifiedItemIndicator": string;
    "settings.numberInputBorder": string;
    "settings.textInputBorder": string;
    "sideBar.background": string;
    "sideBar.border": string;
    "sideBar.foreground": string;
    "sideBarSectionHeader.background": string;
    "sideBarSectionHeader.border": string;
    "sideBarSectionHeader.foreground": string;
    "sideBarTitle.foreground": string;
    "statusBar.background": string;
    "statusBar.border": string;
    "statusBar.debuggingBackground": string;
    "statusBar.debuggingForeground": string;
    "statusBar.focusBorder": string;
    "statusBar.foreground": string;
    "statusBar.noFolderBackground": string;
    "statusBarItem.compactHoverBackground": string;
    "statusBarItem.errorBackground": string;
    "statusBarItem.focusBorder": string;
    "statusBarItem.hoverBackground": string;
    "statusBarItem.prominentBackground": string;
    "statusBarItem.remoteBackground": string;
    "statusBarItem.remoteForeground": string;
    "tab.activeBackground": string;
    "tab.activeBorder": string;
    "tab.activeBorderTop": string;
    "tab.activeForeground": string;
    "tab.border": string;
    "tab.hoverBackground": string;
    "tab.inactiveBackground": string;
    "tab.inactiveForeground": string;
    "tab.lastPinnedBorder": string;
    "tab.selectedBackground": string;
    "tab.selectedBorderTop": string;
    "tab.selectedForeground": string;
    "tab.unfocusedActiveBorder": string;
    "tab.unfocusedActiveBorderTop": string;
    "tab.unfocusedHoverBackground": string;
    "terminal.foreground": string;
    "terminal.inactiveSelectionBackground": string;
    "terminal.tab.activeBorder": string;
    "terminalCursor.foreground": string;
    "textBlockQuote.background": string;
    "textBlockQuote.border": string;
    "textCodeBlock.background": string;
    "textLink.activeForeground": string;
    "textLink.foreground": string;
    "textPreformat.background": string;
    "textPreformat.foreground": string;
    "textSeparator.foreground": string;
    "titleBar.activeBackground": string;
    "titleBar.activeForeground": string;
    "titleBar.border": string;
    "titleBar.inactiveBackground": string;
    "titleBar.inactiveForeground": string;
    "welcomePage.tileBackground": string;
    "widget.border": string;
};
export interface IWorkbenchTheme {
    readonly id: string;
    readonly label: string;
    readonly extensionData?: ExtensionData;
    readonly description?: string;
    readonly settingsId: string | null;
}
export interface IWorkbenchColorTheme extends IWorkbenchTheme, IColorTheme {
    readonly settingsId: string;
    readonly tokenColors: ITextMateThemingRule[];
}
export interface IColorMap {
    [id: string]: Color;
}
export interface IWorkbenchFileIconTheme extends IWorkbenchTheme, IFileIconTheme {
}
export interface IWorkbenchProductIconTheme extends IWorkbenchTheme, IProductIconTheme {
    readonly settingsId: string;
    getIcon(icon: IconContribution): IconDefinition | undefined;
}
export type ThemeSettingTarget = ConfigurationTarget | undefined | "auto" | "preview";
export interface IThemeScopedColorCustomizations {
    [colorId: string]: string;
}
export interface IColorCustomizations {
    [colorIdOrThemeScope: string]: IThemeScopedColorCustomizations | string;
}
export interface IThemeScopedTokenColorCustomizations {
    [groupId: string]: ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
    comments?: string | ITokenColorizationSetting;
    strings?: string | ITokenColorizationSetting;
    numbers?: string | ITokenColorizationSetting;
    keywords?: string | ITokenColorizationSetting;
    types?: string | ITokenColorizationSetting;
    functions?: string | ITokenColorizationSetting;
    variables?: string | ITokenColorizationSetting;
    textMateRules?: ITextMateThemingRule[];
    semanticHighlighting?: boolean;
}
export interface ITokenColorCustomizations {
    [groupIdOrThemeScope: string]: IThemeScopedTokenColorCustomizations | ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
    comments?: string | ITokenColorizationSetting;
    strings?: string | ITokenColorizationSetting;
    numbers?: string | ITokenColorizationSetting;
    keywords?: string | ITokenColorizationSetting;
    types?: string | ITokenColorizationSetting;
    functions?: string | ITokenColorizationSetting;
    variables?: string | ITokenColorizationSetting;
    textMateRules?: ITextMateThemingRule[];
    semanticHighlighting?: boolean;
}
export interface IThemeScopedSemanticTokenColorCustomizations {
    [styleRule: string]: ISemanticTokenRules | boolean | undefined;
    enabled?: boolean;
    rules?: ISemanticTokenRules;
}
export interface ISemanticTokenColorCustomizations {
    [styleRuleOrThemeScope: string]: IThemeScopedSemanticTokenColorCustomizations | ISemanticTokenRules | boolean | undefined;
    enabled?: boolean;
    rules?: ISemanticTokenRules;
}
export interface IThemeScopedExperimentalSemanticTokenColorCustomizations {
    [themeScope: string]: ISemanticTokenRules | undefined;
}
export interface IExperimentalSemanticTokenColorCustomizations {
    [styleRuleOrThemeScope: string]: IThemeScopedExperimentalSemanticTokenColorCustomizations | ISemanticTokenRules | undefined;
}
export type IThemeScopedCustomizations = IThemeScopedColorCustomizations | IThemeScopedTokenColorCustomizations | IThemeScopedExperimentalSemanticTokenColorCustomizations | IThemeScopedSemanticTokenColorCustomizations;
export type IThemeScopableCustomizations = IColorCustomizations | ITokenColorCustomizations | IExperimentalSemanticTokenColorCustomizations | ISemanticTokenColorCustomizations;
export interface ISemanticTokenRules {
    [selector: string]: string | ISemanticTokenColorizationSetting | undefined;
}
export interface ITextMateThemingRule {
    name?: string;
    scope?: string | string[];
    settings: ITokenColorizationSetting;
}
export interface ITokenColorizationSetting {
    foreground?: string;
    background?: string;
    fontStyle?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
}
export interface ISemanticTokenColorizationSetting {
    foreground?: string;
    fontStyle?: string;
    bold?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    italic?: boolean;
}
export interface ExtensionData {
    extensionId: string;
    extensionPublisher: string;
    extensionName: string;
    extensionIsBuiltin: boolean;
}
export declare namespace ExtensionData {
    function toJSONObject(d: ExtensionData | undefined): any;
    function fromJSONObject(o: any): ExtensionData | undefined;
    function fromName(publisher: string, name: string, isBuiltin?: boolean): ExtensionData;
}
export interface IThemeExtensionPoint {
    id: string;
    label?: string;
    description?: string;
    path: string;
    uiTheme?: ThemeTypeSelector;
    _watch: boolean;
}
