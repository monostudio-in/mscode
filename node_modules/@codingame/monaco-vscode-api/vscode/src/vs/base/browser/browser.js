
import { mainWindow } from './window.js';
import { Emitter } from '../common/event.js';

class WindowManager {
    constructor() {
        this.mapWindowIdToZoomLevel = ( new Map());
        this._onDidChangeZoomLevel = ( new Emitter());
        this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
        this.mapWindowIdToZoomFactor = ( new Map());
        this._onDidChangeFullscreen = ( new Emitter());
        this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
        this.mapWindowIdToFullScreen = ( new Map());
    }
    static {
        this.INSTANCE = ( new WindowManager());
    }
    getZoomLevel(targetWindow) {
        return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
    }
    setZoomLevel(zoomLevel, targetWindow) {
        if (this.getZoomLevel(targetWindow) === zoomLevel) {
            return;
        }
        const targetWindowId = this.getWindowId(targetWindow);
        this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
        this._onDidChangeZoomLevel.fire(targetWindowId);
    }
    getZoomFactor(targetWindow) {
        return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
    }
    setZoomFactor(zoomFactor, targetWindow) {
        this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
    }
    setFullscreen(fullscreen, targetWindow) {
        if (this.isFullscreen(targetWindow) === fullscreen) {
            return;
        }
        const windowId = this.getWindowId(targetWindow);
        this.mapWindowIdToFullScreen.set(windowId, fullscreen);
        this._onDidChangeFullscreen.fire(windowId);
    }
    isFullscreen(targetWindow) {
        return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
    }
    getWindowId(targetWindow) {
        return targetWindow.vscodeWindowId;
    }
}
function addMatchMediaChangeListener(targetWindow, query, callback) {
    if (typeof query === "string") {
        query = targetWindow.matchMedia(query);
    }
    query.addEventListener("change", callback);
}
function getZoomLevel(targetWindow) {
    return WindowManager.INSTANCE.getZoomLevel(targetWindow);
}
function getZoomFactor(targetWindow) {
    return WindowManager.INSTANCE.getZoomFactor(targetWindow);
}
function setFullscreen(fullscreen, targetWindow) {
    WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
}
function isFullscreen(targetWindow) {
    return WindowManager.INSTANCE.isFullscreen(targetWindow);
}
const onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
const userAgent = mainWindow.navigator.userAgent;
const isFirefox = (userAgent.indexOf("Firefox") >= 0);
const isWebKit = (userAgent.indexOf("AppleWebKit") >= 0);
const isChrome = (userAgent.indexOf("Chrome") >= 0);
const isSafari = (!isChrome && (userAgent.indexOf("Safari") >= 0));
const isWebkitWebView = (!isChrome && !isSafari && isWebKit);
(userAgent.indexOf("Electron/") >= 0);
const isAndroid = (userAgent.indexOf("Android") >= 0);
let standalone = false;
if (typeof mainWindow.matchMedia === "function") {
    const standaloneMatchMedia = mainWindow.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)");
    const fullScreenMatchMedia = mainWindow.matchMedia("(display-mode: fullscreen)");
    standalone = standaloneMatchMedia.matches;
    addMatchMediaChangeListener(mainWindow, standaloneMatchMedia, (
        {
            matches
        }
    ) => {
        if (standalone && fullScreenMatchMedia.matches) {
            return;
        }
        standalone = matches;
    });
}
function isStandalone() {
    return standalone;
}
function isWCOEnabled() {
    return !!navigator?.windowControlsOverlay?.visible;
}
function getWCOTitlebarAreaRect(targetWindow) {
    return targetWindow.navigator?.windowControlsOverlay?.getTitlebarAreaRect();
}
function getMonacoEnvironment() {
    return globalThis.MonacoEnvironment;
}

export { addMatchMediaChangeListener, getMonacoEnvironment, getWCOTitlebarAreaRect, getZoomFactor, getZoomLevel, isAndroid, isChrome, isFirefox, isFullscreen, isSafari, isStandalone, isWCOEnabled, isWebKit, isWebkitWebView, onDidChangeFullscreen, setFullscreen };
