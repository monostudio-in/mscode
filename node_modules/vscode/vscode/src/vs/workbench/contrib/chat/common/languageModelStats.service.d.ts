import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
export declare const ILanguageModelStatsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelStatsService>;
export interface ILanguageModelStatsService {
    readonly _serviceBrand: undefined;
    update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
}
