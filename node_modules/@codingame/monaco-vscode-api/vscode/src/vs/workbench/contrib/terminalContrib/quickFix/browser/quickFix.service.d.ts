import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ITerminalCommandSelector } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalQuickFixProviderSelector, ITerminalQuickFixProvider } from "./quickFix.js";
export declare const ITerminalQuickFixService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalQuickFixService>;
export interface ITerminalQuickFixService {
    readonly onDidRegisterProvider: Event<ITerminalQuickFixProviderSelector>;
    readonly onDidRegisterCommandSelector: Event<ITerminalCommandSelector>;
    readonly onDidUnregisterProvider: Event<string>;
    readonly _serviceBrand: undefined;
    readonly extensionQuickFixes: Promise<Array<ITerminalCommandSelector>>;
    providers: Map<string, ITerminalQuickFixProvider>;
    registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
    registerCommandSelector(selector: ITerminalCommandSelector): void;
}
