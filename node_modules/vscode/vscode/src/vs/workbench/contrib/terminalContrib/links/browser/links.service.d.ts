import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ITerminalExternalLinkProvider } from "../../../terminal/browser/terminal.js";
export declare const ITerminalLinkProviderService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalLinkProviderService>;
export interface ITerminalLinkProviderService {
    readonly _serviceBrand: undefined;
    readonly linkProviders: ReadonlySet<ITerminalExternalLinkProvider>;
    readonly onDidAddLinkProvider: Event<ITerminalExternalLinkProvider>;
    readonly onDidRemoveLinkProvider: Event<ITerminalExternalLinkProvider>;
    registerLinkProvider(provider: ITerminalExternalLinkProvider): IDisposable;
}
