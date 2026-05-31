import { HydratedTestResult, ITestResult } from "./testResult.js";
export interface ITestResultStorage {
    _serviceBrand: undefined;
    /**
    * Retrieves the list of stored test results.
    */
    read(): Promise<HydratedTestResult[]>;
    /**
    * Persists the list of test results.
    */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
}
export declare const ITestResultStorage: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<unknown>;
