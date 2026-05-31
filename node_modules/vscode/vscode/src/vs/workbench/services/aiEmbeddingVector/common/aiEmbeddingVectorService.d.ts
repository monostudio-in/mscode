import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IAiEmbeddingVectorService } from "./aiEmbeddingVectorService.service.js";
export interface IAiEmbeddingVectorProvider {
    provideAiEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
}
export declare class AiEmbeddingVectorService implements IAiEmbeddingVectorService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    static readonly DEFAULT_TIMEOUT: number;
    private readonly _providers;
    constructor(logService: ILogService);
    isEnabled(): boolean;
    registerAiEmbeddingVectorProvider(model: string, provider: IAiEmbeddingVectorProvider): IDisposable;
    getEmbeddingVector(str: string, token: CancellationToken): Promise<number[]>;
    getEmbeddingVector(strings: string[], token: CancellationToken): Promise<number[][]>;
}
