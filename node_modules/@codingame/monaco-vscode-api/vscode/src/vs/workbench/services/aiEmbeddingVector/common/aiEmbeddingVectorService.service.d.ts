import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IAiEmbeddingVectorProvider } from "./aiEmbeddingVectorService.js";
export declare const IAiEmbeddingVectorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAiEmbeddingVectorService>;
export interface IAiEmbeddingVectorService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    getEmbeddingVector(str: string, token: CancellationToken): Promise<number[]>;
    getEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
    registerAiEmbeddingVectorProvider(model: string, provider: IAiEmbeddingVectorProvider): IDisposable;
}
