import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import * as languages from "../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IExternalOpener } from "../../../../platform/opener/common/opener.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.service.js";
import { IExternalUriOpenerService } from "./externalUriOpenerService.service.js";
export interface IExternalOpenerProvider {
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
}
export interface IExternalUriOpener {
    readonly id: string;
    readonly label: string;
    canOpen(uri: URI, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    openExternalUri(uri: URI, ctx: {
        sourceUri: URI;
    }, token: CancellationToken): Promise<boolean>;
}
export declare class ExternalUriOpenerService extends Disposable implements IExternalUriOpenerService, IExternalOpener {
    private readonly configurationService;
    private readonly logService;
    private readonly preferencesService;
    private readonly quickInputService;
    readonly _serviceBrand: undefined;
    private readonly _providers;
    constructor(openerService: IOpenerService, configurationService: IConfigurationService, logService: ILogService, preferencesService: IPreferencesService, quickInputService: IQuickInputService);
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    private getOpeners;
    openExternal(href: string, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<boolean>;
    getOpener(targetUri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
    private getAllOpenersForUri;
    private getConfiguredOpenerForUri;
    private showOpenerPrompt;
}
