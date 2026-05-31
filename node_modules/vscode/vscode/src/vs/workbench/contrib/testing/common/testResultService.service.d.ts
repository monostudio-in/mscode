import { Event } from "../../../../base/common/event.js";
import { TestResultItemChange, ITestResult, LiveTestResult } from "./testResult.js";
import { ResultChangeEvent } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testResultService";
import { ResolvedTestRunRequest, ExtensionRunTestsRequest, TestResultItem } from "./testTypes.js";
export declare const ITestResultService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestResultService>;
export interface ITestResultService {
    readonly _serviceBrand: undefined;
    /**
    * Fired after any results are added, removed, or completed.
    */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
    * Fired when a test changed it state, or its computed state is updated.
    */
    readonly onTestChanged: Event<TestResultItemChange>;
    /**
    * List of known test results.
    */
    readonly results: ReadonlyArray<ITestResult>;
    /**
    * Discards all completed test results.
    */
    clear(): void;
    /**
    * Creates a new, live test result.
    */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
    * Adds a new test result to the collection.
    */
    push<T extends ITestResult>(result: T): T;
    /**
    * Looks up a set of test results by ID.
    */
    getResult(resultId: string): ITestResult | undefined;
    /**
    * Looks up a test's most recent state, by its extension-assigned ID.
    */
    getStateById(extId: string): [
        results: ITestResult,
        item: TestResultItem
    ] | undefined;
}
