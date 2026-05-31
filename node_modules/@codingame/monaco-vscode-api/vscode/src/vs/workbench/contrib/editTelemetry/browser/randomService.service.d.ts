export declare const IRandomService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRandomService>;
export interface IRandomService {
    readonly _serviceBrand: undefined;
    generateUuid(): string;
    generatePrefixedUuid(prefix: string): string;
}
