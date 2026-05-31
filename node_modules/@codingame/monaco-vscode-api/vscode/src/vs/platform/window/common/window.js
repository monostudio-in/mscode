
import { isWeb, isMacintosh, isNative } from '../../../base/common/platform.js';

const WindowMinimumSize = {
    WIDTH: 400,
    HEIGHT: 270
};
function isWorkspaceToOpen(uriToOpen) {
    return !!uriToOpen.workspaceUri;
}
function isFolderToOpen(uriToOpen) {
    return !!uriToOpen.folderUri;
}
function isFileToOpen(uriToOpen) {
    return !!uriToOpen.fileUri;
}
var MenuSettings;
(function (MenuSettings) {
    MenuSettings["MenuStyle"] = "window.menuStyle";
    MenuSettings["MenuBarVisibility"] = "window.menuBarVisibility";
})(MenuSettings || (MenuSettings = {}));
var MenuStyleConfiguration;
(function (MenuStyleConfiguration) {
    MenuStyleConfiguration["CUSTOM"] = "custom";
    MenuStyleConfiguration["NATIVE"] = "native";
    MenuStyleConfiguration["INHERIT"] = "inherit";
})(MenuStyleConfiguration || (MenuStyleConfiguration = {}));
function hasNativeContextMenu(configurationService, titleBarStyle) {
    if (isWeb) {
        return false;
    }
    const nativeTitle = hasNativeTitlebar(configurationService, titleBarStyle);
    const windowConfigurations = configurationService.getValue('window');
    if (windowConfigurations?.menuStyle === MenuStyleConfiguration.NATIVE) {
        if (!isMacintosh && !nativeTitle) {
            return false;
        }
        return true;
    }
    if (windowConfigurations?.menuStyle === MenuStyleConfiguration.CUSTOM) {
        return false;
    }
    return nativeTitle;
}
function hasNativeMenu(configurationService, titleBarStyle) {
    if (isWeb) {
        return false;
    }
    if (isMacintosh) {
        return true;
    }
    return hasNativeContextMenu(configurationService, titleBarStyle);
}
function getMenuBarVisibility(configurationService) {
    const menuBarVisibility = configurationService.getValue(MenuSettings.MenuBarVisibility);
    if (menuBarVisibility === 'default' || (menuBarVisibility === 'compact' && hasNativeMenu(configurationService)) || (isMacintosh && isNative)) {
        return 'classic';
    }
    else {
        return menuBarVisibility;
    }
}
var TitleBarSetting;
(function (TitleBarSetting) {
    TitleBarSetting["TITLE_BAR_STYLE"] = "window.titleBarStyle";
    TitleBarSetting["CUSTOM_TITLE_BAR_VISIBILITY"] = "window.customTitleBarVisibility";
})(TitleBarSetting || (TitleBarSetting = {}));
var TitlebarStyle;
(function (TitlebarStyle) {
    TitlebarStyle["NATIVE"] = "native";
    TitlebarStyle["CUSTOM"] = "custom";
})(TitlebarStyle || (TitlebarStyle = {}));
var WindowControlsStyle;
(function (WindowControlsStyle) {
    WindowControlsStyle["NATIVE"] = "native";
    WindowControlsStyle["CUSTOM"] = "custom";
    WindowControlsStyle["HIDDEN"] = "hidden";
})(WindowControlsStyle || (WindowControlsStyle = {}));
var CustomTitleBarVisibility;
(function (CustomTitleBarVisibility) {
    CustomTitleBarVisibility["AUTO"] = "auto";
    CustomTitleBarVisibility["WINDOWED"] = "windowed";
    CustomTitleBarVisibility["NEVER"] = "never";
})(CustomTitleBarVisibility || (CustomTitleBarVisibility = {}));
function hasCustomTitlebar(configurationService, titleBarStyle) {
    return true;
}
function hasNativeTitlebar(configurationService, titleBarStyle) {
    if (!titleBarStyle) {
        titleBarStyle = getTitleBarStyle(configurationService);
    }
    return titleBarStyle === TitlebarStyle.NATIVE;
}
function getTitleBarStyle(configurationService) {
    if (isWeb) {
        return TitlebarStyle.CUSTOM;
    }
    const configuration = configurationService.getValue('window');
    if (configuration) {
        const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
        if (useNativeTabs) {
            return TitlebarStyle.NATIVE;
        }
        const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
        if (useSimpleFullScreen) {
            return TitlebarStyle.NATIVE;
        }
        const style = configuration.titleBarStyle;
        if (style === TitlebarStyle.NATIVE || style === TitlebarStyle.CUSTOM) {
            return style;
        }
    }
    return TitlebarStyle.CUSTOM;
}
function getWindowControlsStyle(configurationService) {
    if (isWeb || isMacintosh || getTitleBarStyle(configurationService) === TitlebarStyle.NATIVE) {
        return WindowControlsStyle.NATIVE;
    }
    const configuration = configurationService.getValue('window');
    const style = configuration?.controlsStyle;
    if (style === WindowControlsStyle.CUSTOM || style === WindowControlsStyle.HIDDEN) {
        return style;
    }
    return WindowControlsStyle.NATIVE;
}
const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
function useWindowControlsOverlay(configurationService) {
    if (isWeb) {
        return false;
    }
    if (hasNativeTitlebar(configurationService)) {
        return false;
    }
    if (!isMacintosh) {
        const setting = getWindowControlsStyle(configurationService);
        if (setting === WindowControlsStyle.CUSTOM || setting === WindowControlsStyle.HIDDEN) {
            return false;
        }
    }
    return true;
}
const DEFAULT_EMPTY_WINDOW_SIZE = { width: 1200, height: 800 };
const DEFAULT_WORKSPACE_WINDOW_SIZE = { width: 1440, height: 900 };
const DEFAULT_AUX_WINDOW_SIZE = { width: 1024, height: 768 };

export { CustomTitleBarVisibility, DEFAULT_AUX_WINDOW_SIZE, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, DEFAULT_EMPTY_WINDOW_SIZE, DEFAULT_WORKSPACE_WINDOW_SIZE, MenuSettings, MenuStyleConfiguration, TitleBarSetting, TitlebarStyle, WindowControlsStyle, WindowMinimumSize, getMenuBarVisibility, getTitleBarStyle, getWindowControlsStyle, hasCustomTitlebar, hasNativeContextMenu, hasNativeMenu, hasNativeTitlebar, isFileToOpen, isFolderToOpen, isWorkspaceToOpen, useWindowControlsOverlay };
