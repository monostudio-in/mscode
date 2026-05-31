import { Event } from "../../../base/common/event.js";
import { IReloadSessionEvent, ICloseSessionEvent, IAttachSessionEvent, ITerminateSessionEvent, IOpenExtensionWindowResult } from "./extensionHostDebug.js";
export declare const IExtensionHostDebugService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionHostDebugService>;
export interface IExtensionHostDebugService {
    readonly _serviceBrand: undefined;
    reload(sessionId: string): void;
    readonly onReload: Event<IReloadSessionEvent>;
    close(sessionId: string): void;
    readonly onClose: Event<ICloseSessionEvent>;
    attachSession(sessionId: string, port: number, subId?: string): void;
    readonly onAttachSession: Event<IAttachSessionEvent>;
    terminateSession(sessionId: string, subId?: string): void;
    readonly onTerminateSession: Event<ITerminateSessionEvent>;
    openExtensionDevelopmentHostWindow(args: string[], debugRenderer: boolean): Promise<IOpenExtensionWindowResult>;
    attachToCurrentWindowRenderer(windowId: number): Promise<IOpenExtensionWindowResult>;
}
