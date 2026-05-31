
import { getNLSLanguage } from '../../nls.js';

const LANGUAGE_DEFAULT = "en";
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isElectron = false;
let _isIOS = false;
let _isCI = false;
let _isMobile = false;
let _locale = undefined;
let _language = LANGUAGE_DEFAULT;
let _platformLocale = LANGUAGE_DEFAULT;
let _translationsConfigFile = undefined;
let _userAgent = undefined;
const $globalThis = globalThis;
let nodeProcess = undefined;
if (typeof $globalThis.vscode !== "undefined" && typeof $globalThis.vscode.process !== "undefined") {
    nodeProcess = $globalThis.vscode.process;
} else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
    nodeProcess = process;
}
const isElectronProcess = typeof nodeProcess?.versions?.electron === "string";
const isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";
if (typeof nodeProcess === "object") {
    _isWindows = (nodeProcess.platform === "win32");
    _isMacintosh = (nodeProcess.platform === "darwin");
    _isLinux = (nodeProcess.platform === "linux");
    _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
    _isElectron = isElectronProcess;
    _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"] || !!nodeProcess.env["GITHUB_WORKSPACE"];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
    if (rawNlsConfig) {
        try {
            const nlsConfig = JSON.parse(rawNlsConfig);
            _locale = nlsConfig.userLocale;
            _platformLocale = nlsConfig.osLocale;
            _language = nlsConfig.resolvedLanguage || LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig.languagePack?.translationsConfigFile;
        } catch (e) {}
    }
    _isNative = true;
}
else if (typeof navigator === "object" && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf("Windows") >= 0;
    _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
    _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    _isLinux = _userAgent.indexOf("Linux") >= 0;
    _isMobile = _userAgent?.indexOf("Mobi") >= 0;
    _isWeb = true;
    _language = getNLSLanguage() || LANGUAGE_DEFAULT;
    _locale = navigator.language.toLowerCase();
    _platformLocale = _locale;
}
else {
    console.error("Unable to resolve platform.");
}
var Platform;
(function(Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform || (Platform = {}));
function PlatformToString(platform) {
    switch (platform) {
    case Platform.Web:
        return "Web";
    case Platform.Mac:
        return "Mac";
    case Platform.Linux:
        return "Linux";
    case Platform.Windows:
        return "Windows";
    }
}
let _platform = Platform.Web;
if (_isMacintosh) {
    _platform = Platform.Mac;
} else if (_isWindows) {
    _platform = Platform.Windows;
} else if (_isLinux) {
    _platform = Platform.Linux;
}
const isWindows = _isWindows;
const isMacintosh = _isMacintosh;
const isLinux = _isLinux;
const isLinuxSnap = _isLinuxSnap;
const isNative = _isNative;
const isElectron = _isElectron;
const isWeb = _isWeb;
const isWebWorker = (_isWeb && typeof $globalThis.importScripts === "function");
const webWorkerOrigin = isWebWorker ? $globalThis.origin : undefined;
const isIOS = _isIOS;
const isMobile = _isMobile;
const isCI = _isCI;
const platform = _platform;
const userAgent = _userAgent;
const language = _language;
var Language;
(function(Language) {
    function value() {
        return language;
    }
    Language.value = value;
    function isDefaultVariant() {
        if (language.length === 2) {
            return language === "en";
        } else if (language.length >= 3) {
            return language[0] === "e" && language[1] === "n" && language[2] === "-";
        } else {
            return false;
        }
    }
    Language.isDefaultVariant = isDefaultVariant;
    function isDefault() {
        return language === "en";
    }
    Language.isDefault = isDefault;
})(Language || (Language = {}));
const locale = _locale;
const platformLocale = _platformLocale;
const setTimeout0IsFaster = (typeof $globalThis.postMessage === "function" && !$globalThis.importScripts);
const setTimeout0 = (() => {
    if (setTimeout0IsFaster) {
        const pending = [];
        $globalThis.addEventListener("message", e => {
            if (e.data && e.data.vscodeScheduleAsyncWork) {
                for (let i = 0, len = pending.length; i < len; i++) {
                    const candidate = pending[i];
                    if (candidate.id === e.data.vscodeScheduleAsyncWork) {
                        pending.splice(i, 1);
                        candidate.callback();
                        return;
                    }
                }
            }
        });
        let lastId = 0;
        return callback => {
            const myId = ++lastId;
            pending.push({
                id: myId,
                callback: callback
            });
            $globalThis.postMessage({
                vscodeScheduleAsyncWork: myId
            }, "*");
        };
    }
    return callback => setTimeout(callback);
})();
var OperatingSystem;
(function(OperatingSystem) {
    OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
    OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
    OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
})(OperatingSystem || (OperatingSystem = {}));
const OS = (_isMacintosh || _isIOS ? OperatingSystem.Macintosh : (_isWindows ? OperatingSystem.Windows : OperatingSystem.Linux));
let _isLittleEndian = true;
let _isLittleEndianComputed = false;
function isLittleEndian() {
    if (!_isLittleEndianComputed) {
        _isLittleEndianComputed = true;
        const test = ( new Uint8Array(2));
        test[0] = 1;
        test[1] = 2;
        const view = ( new Uint16Array(test.buffer));
        _isLittleEndian = (view[0] === (2 << 8) + 1);
    }
    return _isLittleEndian;
}
const isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);
const isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);
const isSafari = !!(!isChrome && (userAgent && userAgent.indexOf("Safari") >= 0));
const isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);
const isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);

export { LANGUAGE_DEFAULT, Language, OS, OperatingSystem, Platform, PlatformToString, isAndroid, isCI, isChrome, isEdge, isElectron, isFirefox, isIOS, isLinux, isLinuxSnap, isLittleEndian, isMacintosh, isMobile, isNative, isSafari, isWeb, isWebWorker, isWindows, language, locale, platform, platformLocale, setTimeout0, setTimeout0IsFaster, userAgent, webWorkerOrigin };
