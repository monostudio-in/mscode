import { IObservable, ISettableObservable } from "../../../../base/common/observable.js";
import { TestCoverage } from "./testCoverage.js";
import { TestId } from "./testId.js";
import { ITestRunTaskResults } from "./testResult.js";
export declare const ITestCoverageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestCoverageService>;
export interface ITestCoverageService {
    readonly _serviceBrand: undefined;
    /**
    * Settable observable that can be used to show the test coverage instance
    * currently in the editor.
    */
    readonly selected: IObservable<TestCoverage | undefined>;
    /**
    * Filter to per-test coverage from the given test ID.
    */
    readonly filterToTest: ISettableObservable<TestId | undefined>;
    /**
    * Whether inline coverage is shown.
    */
    readonly showInline: ISettableObservable<boolean>;
    /**
    * Opens a test coverage report from a task, optionally focusing it in the editor.
    */
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    /**
    * Closes any open coverage.
    */
    closeCoverage(): void;
}
