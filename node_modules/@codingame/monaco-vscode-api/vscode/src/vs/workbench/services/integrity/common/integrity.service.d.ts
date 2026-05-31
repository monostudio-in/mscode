import { IntegrityTestResult } from "./integrity.js";
export declare const IIntegrityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IIntegrityService>;
export interface IIntegrityService {
    readonly _serviceBrand: undefined;
    isPure(): Promise<IntegrityTestResult>;
}
