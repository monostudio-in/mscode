import type { Lambda } from '../lambda';
import type { DeserializeBuildOutputOptions, DeserializeBuildOutputResult } from './deserialize-build-output-types';
export declare function validateDeploymentId(deploymentId?: string): void;
export declare function deserializeBuildOutput<TFlags = unknown, TMeta = unknown, TLambda extends Lambda = Lambda>(options: DeserializeBuildOutputOptions<TMeta, TLambda>): Promise<DeserializeBuildOutputResult<TFlags, TMeta>>;
