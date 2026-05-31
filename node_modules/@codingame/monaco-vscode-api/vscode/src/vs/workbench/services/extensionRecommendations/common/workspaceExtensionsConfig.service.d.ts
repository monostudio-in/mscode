import { Event } from "../../../../base/common/event.js";
import { IExtensionsConfigContent } from "./workspaceExtensionsConfig.js";
export declare const IWorkspaceExtensionsConfigService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceExtensionsConfigService>;
export interface IWorkspaceExtensionsConfigService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeExtensionsConfigs: Event<void>;
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
}
