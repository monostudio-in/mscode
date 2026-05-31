import { IExtensionApiFactory } from "../common/extHost.api.impl.js";
import { ExtensionActivationTimesBuilder } from "../common/extHostExtensionActivator.js";
import { AbstractExtHostExtensionService } from "../common/extHostExtensionService.js";
import { URI } from "../../../base/common/uri.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtensionRuntime } from "../common/extHostTypes.js";
export declare class ExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly extensionRuntime = ExtensionRuntime.Webworker;
    private _fakeModules?;
    protected _apiFactory?: IExtensionApiFactory;
    protected _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected _loadCommonJSModule<T extends object | undefined>(extension: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    protected _loadESMModule<T>(extension: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    $setRemoteEnvironment(_env: {
        [key: string]: string | null;
    }): Promise<void>;
    private _waitForDebuggerAttachment;
}
