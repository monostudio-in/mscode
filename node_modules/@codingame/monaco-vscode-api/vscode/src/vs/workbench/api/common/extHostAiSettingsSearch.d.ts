import type { SettingsSearchProvider } from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { AiSettingsSearchProviderOptions } from "../../services/aiSettingsSearch/common/aiSettingsSearch.js";
import { ExtHostAiSettingsSearchShape, IMainContext } from "./extHost.protocol.js";
import { Disposable } from "./extHostTypes.js";
export declare class ExtHostAiSettingsSearch implements ExtHostAiSettingsSearchShape {
    private _settingsSearchProviders;
    private _nextHandle;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $startSearch(handle: number, query: string, option: AiSettingsSearchProviderOptions, token: CancellationToken): Promise<void>;
    registerSettingsSearchProvider(extension: IExtensionDescription, provider: SettingsSearchProvider): Disposable;
}
