
import { TargetPlatform, ExtensionType } from './vscode/src/vs/platform/extensions/common/extensions.js';
import { IExtensionService } from './vscode/src/vs/workbench/services/extensions/common/extensions.service.js';
import { URI } from './vscode/src/vs/base/common/uri.js';
import { getExtensionId } from './vscode/src/vs/platform/extensionManagement/common/extensionManagementUtil.js';
import { DisposableStore } from './vscode/src/vs/base/common/lifecycle.js';
import { joinPath } from './vscode/src/vs/base/common/resources.js';
import { FileAccess, Schemas } from './vscode/src/vs/base/common/network.js';
import { ExtensionHostKind } from './vscode/src/vs/workbench/services/extensions/common/extensionHostKind.js';
import { IWorkbenchEnvironmentService } from './vscode/src/vs/workbench/services/environment/common/environmentService.service.js';
import { parse } from './vscode/src/vs/base/common/json.js';
import { IFileService } from './vscode/src/vs/platform/files/common/files.service.js';
import { IInstantiationService } from './vscode/src/vs/platform/instantiation/common/instantiation.js';
import { IWorkbenchExtensionEnablementService } from './vscode/src/vs/workbench/services/extensionManagement/common/extensionManagement.service.js';
import { StandaloneServices } from './vscode/src/vs/editor/standalone/browser/standaloneServices.js';
import { ExtensionManifestTranslator } from './vscode/src/vs/platform/extensionManagement/common/extensionsScannerService.js';
import { language } from './vscode/src/vs/base/common/platform.js';
import { registerExtensionFile, RegisteredUriFile, CustomSchemas } from '@codingame/monaco-vscode-files-service-override';
import { waitServicesReady, servicesInitialized } from './lifecycle.js';
import { throttle } from './tools.js';
import { getBuiltInExtensionTranslationsUris, getLocalizationManifest } from './l10n.js';
import { toExtensionDescription } from './vscode/src/vs/workbench/services/extensions/common/extensions.js';

let apiFactory;
function registerLocalApiFactory(_apiFactory) {
    apiFactory = _apiFactory;
}
let defaultApiHandler;
function registerDefaultApiHandler(handler) {
    defaultApiHandler = handler;
}
function registerExtensionFileUrl(extensionLocation, filePath, url, metadataOrMimeType) {
    const fileDisposable = new DisposableStore();
    fileDisposable.add(FileAccess.registerStaticBrowserUri(joinPath(extensionLocation, filePath), URI.parse(url)));
    const metadata = typeof metadataOrMimeType === 'string' ? { mimeType: metadataOrMimeType } : metadataOrMimeType;
    fileDisposable.add(registerExtensionFile(new RegisteredUriFile(joinPath(extensionLocation, filePath), url, metadata)));
    return fileDisposable;
}
const deltaExtensions = throttle(async ({ toAdd, toRemove }) => {
    await waitServicesReady();
    const extensionService = StandaloneServices.get(IExtensionService);
    await extensionService.deltaExtensions(toAdd, toRemove);
}, (a, b) => ({ toAdd: [...a.toAdd, ...b.toAdd], toRemove: [...a.toRemove, ...b.toRemove] }), 0);
async function registerRemoteExtension(options) {
    options = typeof options === 'string' ? { path: options } : options;
    await waitServicesReady();
    const fileService = StandaloneServices.get(IFileService);
    const remoteAuthority = StandaloneServices.get(IWorkbenchEnvironmentService).remoteAuthority;
    const content = await fileService.readFile(joinPath(URI.from({ scheme: Schemas.vscodeRemote, authority: remoteAuthority, path: options.path }), 'package.json'));
    const manifest = parse(content.value.toString());
    return registerExtension(manifest, ExtensionHostKind.Remote, options);
}
const forcedExtensionHostKinds = new Map();
const builtinExtensions = [];
function getBuiltinExtensions() {
    return builtinExtensions;
}
function getForcedExtensionHostKind(id) {
    return forcedExtensionHostKinds.get(id);
}
function registerExtension(manifest, extHostKind, { path = '/extension', system = false, readmePath, changelogPath } = {}) {
    const id = getExtensionId(manifest.publisher, manifest.name);
    const location = URI.from({ scheme: CustomSchemas.extensionFile, authority: id, path });
    let addExtensionPromise = waitServicesReady();
    const extension = {
        manifest,
        type: system ? ExtensionType.System : ExtensionType.User,
        isBuiltin: true,
        identifier: { id },
        location,
        targetPlatform: TargetPlatform.WEB,
        isValid: true,
        validations: [],
        readmeUrl: readmePath != null ? URI.joinPath(location, readmePath) : undefined,
        changelogUrl: changelogPath != null ? URI.joinPath(location, changelogPath) : undefined,
        preRelease: false
    };
    if (extHostKind != null) {
        forcedExtensionHostKinds.set(id, extHostKind);
    }
    if (!servicesInitialized && extHostKind !== ExtensionHostKind.Remote) {
        builtinExtensions.push(extension);
    }
    else {
        addExtensionPromise = addExtensionPromise.then(async () => {
            const instantiationService = StandaloneServices.get(IInstantiationService);
            const extensionEnablementService = StandaloneServices.get(IWorkbenchExtensionEnablementService);
            const extensionService = StandaloneServices.get(IExtensionService);
            if (extensionEnablementService.isEnabled(extension) &&
                extensionService.canAddExtension(toExtensionDescription(extension, false))) {
                const remoteAuthority = StandaloneServices.get(IWorkbenchEnvironmentService).remoteAuthority;
                let realLocation = location;
                if (extHostKind === ExtensionHostKind.Remote) {
                    realLocation = URI.from({
                        scheme: Schemas.vscodeRemote,
                        authority: remoteAuthority,
                        path
                    });
                }
                const translator = instantiationService.createInstance(ExtensionManifestTranslator);
                const nlsConfiguration = {
                    devMode: false,
                    language: language,
                    pseudo: language === 'pseudo',
                    translations: getBuiltInExtensionTranslationsUris(language) ?? {}
                };
                const localizedExtension = {
                    ...extension,
                    manifest: await translator.translateManifest(realLocation, manifest, nlsConfiguration)
                };
                await deltaExtensions({ toAdd: [localizedExtension], toRemove: [] });
            }
        });
    }
    let api = {
        id,
        async whenReady() {
            await addExtensionPromise;
        },
        async isEnabled() {
            await waitServicesReady();
            const extensionEnablementService = StandaloneServices.get(IWorkbenchExtensionEnablementService);
            await addExtensionPromise;
            return extensionEnablementService.isEnabled(extension);
        },
        async dispose() {
            await addExtensionPromise;
            const index = builtinExtensions.indexOf(extension);
            if (index >= 0) {
                builtinExtensions.splice(builtinExtensions.indexOf(extension), 1);
            }
            forcedExtensionHostKinds.delete(id);
            await deltaExtensions({ toAdd: [], toRemove: [extension] });
        }
    };
    if (extHostKind !== ExtensionHostKind.Remote) {
        function registerFileUrl(path, url, metadataOrMimeType) {
            return registerExtensionFileUrl(location, path, url, metadataOrMimeType);
        }
        api = {
            ...api,
            registerFileUrl
        };
    }
    if (extHostKind === ExtensionHostKind.LocalProcess) {
        async function getApi() {
            await addExtensionPromise;
            if (apiFactory == null) {
                throw new Error("The local api can't be used without registering the local extension host by importing `vscode/localExtensionHost`");
            }
            return await apiFactory(id);
        }
        api = {
            ...api,
            getApi,
            async setAsDefaultApi() {
                defaultApiHandler?.(await getApi());
            }
        };
    }
    return api;
}
const localizationManifest = getLocalizationManifest();
if (localizationManifest != null) {
    registerExtension(localizationManifest, ExtensionHostKind.LocalWebWorker, { system: true });
}

export { ExtensionHostKind, getBuiltinExtensions, getForcedExtensionHostKind, registerDefaultApiHandler, registerExtension, registerLocalApiFactory, registerRemoteExtension };
