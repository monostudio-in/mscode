import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IExtensionContributedURLHandler } from "./extensionUrlHandler.js";
export declare const IExtensionUrlHandler: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionUrlHandler>;
export interface IExtensionUrlHandler {
    readonly _serviceBrand: undefined;
    registerExtensionHandler(extensionId: ExtensionIdentifier, handler: IExtensionContributedURLHandler): void;
    unregisterExtensionHandler(extensionId: ExtensionIdentifier): void;
}
