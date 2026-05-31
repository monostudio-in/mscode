import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { ITestProfileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testProfileService.service";
import { ITestResultService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testResultService.service";
import { ITestService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testService.service";
import { CoverageDetails, ExtensionRunTestsRequest, IFileCoverage, ITestItem, ITestMessage, ITestRunProfile, ITestRunTask, ResolvedTestRunRequest, TestControllerCapability, TestResultState, TestsDiffOp } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testTypes";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ILocationDto, ITestControllerPatch, MainThreadTestingShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadTesting extends Disposable implements MainThreadTestingShape {
    private readonly uriIdentityService;
    private readonly testService;
    private readonly testProfiles;
    private readonly resultService;
    private readonly proxy;
    private readonly diffListener;
    private readonly testProviderRegistrations;
    constructor(extHostContext: IExtHostContext, uriIdentityService: IUriIdentityService, testService: ITestService, testProfiles: ITestProfileService, resultService: ITestResultService);
    /**
     * @inheritdoc
     */
    $markTestRetired(testIds: string[] | undefined): void;
    /**
     * @inheritdoc
     */
    $publishTestRunProfile(profile: ITestRunProfile): void;
    /**
     * @inheritdoc
     */
    $updateTestRunConfig(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    /**
     * @inheritdoc
     */
    $removeTestProfile(controllerId: string, profileId: number): void;
    /**
     * @inheritdoc
     */
    $addTestsToRun(controllerId: string, runId: string, tests: ITestItem.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $appendCoverage(runId: string, taskId: string, coverage: IFileCoverage.Serialized): void;
    /**
     * @inheritdoc
     */
    $startedExtensionTestRun(req: ExtensionRunTestsRequest): void;
    /**
     * @inheritdoc
     */
    $startedTestRunTask(runId: string, task: ITestRunTask): void;
    /**
     * @inheritdoc
     */
    $finishedTestRunTask(runId: string, taskId: string): void;
    /**
     * @inheritdoc
     */
    $finishedExtensionTestRun(runId: string): void;
    /**
     * @inheritdoc
     */
    $updateTestStateInRun(runId: string, taskId: string, testId: string, state: TestResultState, duration?: number): void;
    /**
     * @inheritdoc
     */
    $appendOutputToRun(runId: string, taskId: string, output: VSBuffer, locationDto?: ILocationDto, testId?: string): void;
    /**
     * @inheritdoc
     */
    $appendTestMessagesInRun(runId: string, taskId: string, testId: string, messages: ITestMessage.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $registerTestController(controllerId: string, _label: string, _capabilities: TestControllerCapability): void;
    /**
     * @inheritdoc
     */
    $updateController(controllerId: string, patch: ITestControllerPatch): void;
    /**
     * @inheritdoc
     */
    $unregisterTestController(controllerId: string): void;
    /**
     * @inheritdoc
     */
    $subscribeToDiffs(): void;
    /**
     * @inheritdoc
     */
    $unsubscribeFromDiffs(): void;
    /**
     * @inheritdoc
     */
    $publishDiff(controllerId: string, diff: TestsDiffOp.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $runTests(req: ResolvedTestRunRequest, token: CancellationToken): Promise<string>;
    /**
     * @inheritdoc
     */
    $getCoverageDetails(resultId: string, taskIndex: number, uri: UriComponents, token: CancellationToken): Promise<CoverageDetails.Serialized[]>;
    dispose(): void;
    private withLiveRun;
}
