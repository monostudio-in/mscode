import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Location } from "../../../../editor/common/languages.js";
import { MutableObservableValue } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/observableValue";
import { TestExclusions } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testExclusions";
import { ITestResult } from "./testResult.js";
import { IMainThreadTestCollection, IMainThreadTestHostProxy, IMainThreadTestController, AmbiguousRunTestsRequest, ITestFollowups } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testService";
import { TestsDiff, ResolvedTestRunRequest, TestMessageFollowupRequest, InternalTestItem } from "./testTypes.js";
export declare const ITestService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestService>;
export interface ITestService {
    readonly _serviceBrand: undefined;
    /**
    * Fires when the user requests to cancel a test run -- or all runs, if no
    * runId is given.
    */
    readonly onDidCancelTestRun: Event<{
        runId: string | undefined;
        taskId: string | undefined;
    }>;
    /**
    * Event that fires when the excluded tests change.
    */
    readonly excluded: TestExclusions;
    /**
    * Test collection instance.
    */
    readonly collection: IMainThreadTestCollection;
    /**
    * Event that fires immediately before a diff is processed.
    */
    readonly onWillProcessDiff: Event<TestsDiff>;
    /**
    * Event that fires after a diff is processed.
    */
    readonly onDidProcessDiff: Event<TestsDiff>;
    /**
    * Whether inline editor decorations should be visible.
    */
    readonly showInlineOutput: MutableObservableValue<boolean>;
    /**
    * Registers an interface that represents an extension host..
    */
    registerExtHost(controller: IMainThreadTestHostProxy): IDisposable;
    /**
    * Registers an interface that runs tests for the given provider ID.
    */
    registerTestController(providerId: string, controller: IMainThreadTestController): IDisposable;
    /**
    * Gets a registered test controller by ID.
    */
    getTestController(controllerId: string): IMainThreadTestController | undefined;
    /**
    * Refreshes tests for the controller, or all controllers if no ID is given.
    */
    refreshTests(controllerId?: string): Promise<void>;
    /**
    * Cancels any ongoing test refreshes.
    */
    cancelRefreshTests(): void;
    /**
    * Requests that tests be executed continuously, until the token is cancelled.
    */
    startContinuousRun(req: ResolvedTestRunRequest, token: CancellationToken): Promise<void>;
    /**
    * Requests that tests be executed.
    */
    runTests(req: AmbiguousRunTestsRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
    * Requests that tests be executed.
    */
    runResolvedTests(req: ResolvedTestRunRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
    * Provides followup actions for a test run.
    */
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<ITestFollowups>;
    /**
    * Ensures the test diff from the remote ext host is flushed and waits for
    * any "busy" tests to become idle before resolving.
    */
    syncTests(): Promise<void>;
    /**
    * Cancels an ongoing test run by its ID, or all runs if no ID is given.
    */
    cancelTestRun(runId?: string, taskId?: string): void;
    /**
    * Publishes a test diff for a controller.
    */
    publishDiff(controllerId: string, diff: TestsDiff): void;
    /**
    * Gets all tests related to the given code position.
    */
    getTestsRelatedToCode(uri: URI, position: Position, token?: CancellationToken): Promise<InternalTestItem[]>;
    /**
    * Gets code related to the given test item.
    */
    getCodeRelatedToTest(test: InternalTestItem, token?: CancellationToken): Promise<Location[]>;
}
