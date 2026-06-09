import type { NodeVersion } from './types';
type CliType = 'yarn' | 'npm' | 'pnpm' | 'bun' | 'vlt';
export declare function generateProjectManifest({ workPath, nodeVersion, cliType, lockfilePath, lockfileVersion, framework, serviceType, }: {
    workPath: string;
    nodeVersion: NodeVersion;
    cliType: CliType;
    lockfilePath: string | undefined;
    lockfileVersion: number | undefined;
    framework?: string;
    serviceType?: string;
}): Promise<void>;
export {};
