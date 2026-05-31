
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable, MutableDisposable, DisposableStore, toDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/index';
import { WellDefinedPrefixTree } from '@codingame/monaco-vscode-api/vscode/vs/base/common/prefixTree';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { Range } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/core/range';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { TestCoverage } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testCoverage';
import { TestId } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testId';
import { ITestProfileService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testProfileService.service';
import { LiveTestResult } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testResultService.service';
import { ITestService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testService.service';
import { TestRunProfileBitset, ITestItem, IFileCoverage, CoverageDetails, ITestMessage, TestsDiffOp } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/testing/common/testTypes';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { transaction } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/transaction';
import { observableValue } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/observables/observableValue';

let MainThreadTesting = class MainThreadTesting extends Disposable {
    constructor(
        extHostContext,
        uriIdentityService,
        testService,
        testProfiles,
        resultService
    ) {
        super();
        this.uriIdentityService = uriIdentityService;
        this.testService = testService;
        this.testProfiles = testProfiles;
        this.resultService = resultService;
        this.diffListener = this._register(( new MutableDisposable()));
        this.testProviderRegistrations = ( new Map());
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostTesting));
        this._register(this.testService.registerExtHost({
            provideTestFollowups: (req, token) => this.proxy.$provideTestFollowups(req, token),
            executeTestFollowup: id => this.proxy.$executeTestFollowup(id),
            disposeTestFollowups: ids => this.proxy.$disposeTestFollowups(ids),
            getTestsRelatedToCode: (uri, position, token) => this.proxy.$getTestsRelatedToCode(uri, position, token)
        }));
        this._register(this.testService.onDidCancelTestRun((
            {
                runId,
                taskId
            }
        ) => {
            this.proxy.$cancelExtensionTestRun(runId, taskId);
        }));
        this._register(Event.debounce(testProfiles.onDidChange, (_last, e) => e)(() => {
            const obj = {};
            for (const group of [
                TestRunProfileBitset.Run,
                TestRunProfileBitset.Debug,
                TestRunProfileBitset.Coverage
            ]) {
                for (const profile of this.testProfiles.getGroupDefaultProfiles(group)) {
                    obj[profile.controllerId] ??= [];
                    obj[profile.controllerId].push(profile.profileId);
                }
            }
            this.proxy.$setDefaultRunProfiles(obj);
        }));
        this._register(resultService.onResultsChanged(evt => {
            if ("completed" in evt) {
                const serialized = evt.completed.toJSONWithMessages();
                if (serialized) {
                    this.proxy.$publishTestResults([serialized]);
                }
            } else if ("removed" in evt) {
                evt.removed.forEach(r => {
                    if (r instanceof LiveTestResult) {
                        this.proxy.$disposeRun(r.id);
                    }
                });
            }
        }));
    }
    $markTestRetired(testIds) {
        let tree;
        if (testIds) {
            tree = ( new WellDefinedPrefixTree());
            for (const id of testIds) {
                tree.insert(TestId.fromString(id).path, undefined);
            }
        }
        for (const result of this.resultService.results) {
            if (result instanceof LiveTestResult) {
                result.markRetired(tree);
            }
        }
    }
    $publishTestRunProfile(profile) {
        const controller = this.testProviderRegistrations.get(profile.controllerId);
        if (controller) {
            this.testProfiles.addProfile(controller.instance, profile);
        }
    }
    $updateTestRunConfig(controllerId, profileId, update) {
        this.testProfiles.updateProfile(controllerId, profileId, update);
    }
    $removeTestProfile(controllerId, profileId) {
        this.testProfiles.removeProfile(controllerId, profileId);
    }
    $addTestsToRun(controllerId, runId, tests) {
        this.withLiveRun(runId, r => r.addTestChainToRun(controllerId, ( tests.map(t => ITestItem.deserialize(this.uriIdentityService, t)))));
    }
    $appendCoverage(runId, taskId, coverage) {
        this.withLiveRun(runId, run => {
            const task = run.tasks.find(t => t.id === taskId);
            if (!task) {
                return;
            }
            const deserialized = IFileCoverage.deserialize(this.uriIdentityService, coverage);
            transaction(tx => {
                let value = task.coverage.read(undefined);
                if (!value) {
                    value = ( new TestCoverage(run, taskId, this.uriIdentityService, {
                        getCoverageDetails: (id, testId, token) => this.proxy.$getCoverageDetails(id, testId, token).then(r => ( r.map(CoverageDetails.deserialize)))
                    }));
                    value.append(deserialized, tx);
                    task.coverage.set(value, tx);
                } else {
                    value.append(deserialized, tx);
                }
            });
        });
    }
    $startedExtensionTestRun(req) {
        this.resultService.createLiveResult(req);
    }
    $startedTestRunTask(runId, task) {
        this.withLiveRun(runId, r => r.addTask(task));
    }
    $finishedTestRunTask(runId, taskId) {
        this.withLiveRun(runId, r => r.markTaskComplete(taskId));
    }
    $finishedExtensionTestRun(runId) {
        this.withLiveRun(runId, r => r.markComplete());
    }
    $updateTestStateInRun(runId, taskId, testId, state, duration) {
        this.withLiveRun(runId, r => r.updateState(testId, taskId, state, duration));
    }
    $appendOutputToRun(runId, taskId, output, locationDto, testId) {
        const location = locationDto && {
            uri: URI.revive(locationDto.uri),
            range: Range.lift(locationDto.range)
        };
        this.withLiveRun(runId, r => r.appendOutput(output, taskId, location, testId));
    }
    $appendTestMessagesInRun(runId, taskId, testId, messages) {
        const r = this.resultService.getResult(runId);
        if (r && r instanceof LiveTestResult) {
            for (const message of messages) {
                r.appendMessage(testId, taskId, ITestMessage.deserialize(this.uriIdentityService, message));
            }
        }
    }
    $registerTestController(controllerId, _label, _capabilities) {
        const disposable = ( new DisposableStore());
        const label = observableValue(`${controllerId}.label`, _label);
        const capabilities = observableValue(`${controllerId}.cap`, _capabilities);
        const controller = {
            id: controllerId,
            label,
            capabilities,
            syncTests: () => this.proxy.$syncTests(),
            refreshTests: token => this.proxy.$refreshTests(controllerId, token),
            configureRunProfile: id => this.proxy.$configureRunProfile(controllerId, id),
            runTests: (reqs, token) => this.proxy.$runControllerTests(reqs, token),
            startContinuousRun: (reqs, token) => this.proxy.$startContinuousRun(reqs, token),
            expandTest: (testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1),
            getRelatedCode: (testId, token) => this.proxy.$getCodeRelatedToTest(testId, token).then(locations => ( locations.map(l => ({
                uri: URI.revive(l.uri),
                range: Range.lift(l.range)
            }))))
        };
        disposable.add(toDisposable(() => this.testProfiles.removeProfile(controllerId)));
        disposable.add(this.testService.registerTestController(controllerId, controller));
        this.testProviderRegistrations.set(controllerId, {
            instance: controller,
            label,
            capabilities,
            disposable
        });
    }
    $updateController(controllerId, patch) {
        const controller = this.testProviderRegistrations.get(controllerId);
        if (!controller) {
            return;
        }
        transaction(tx => {
            if (patch.label !== undefined) {
                controller.label.set(patch.label, tx);
            }
            if (patch.capabilities !== undefined) {
                controller.capabilities.set(patch.capabilities, tx);
            }
        });
    }
    $unregisterTestController(controllerId) {
        this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
        this.testProviderRegistrations.delete(controllerId);
    }
    $subscribeToDiffs() {
        this.proxy.$acceptDiff(( this.testService.collection.getReviverDiff().map(TestsDiffOp.serialize)));
        this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
    }
    $unsubscribeFromDiffs() {
        this.diffListener.clear();
    }
    $publishDiff(controllerId, diff) {
        this.testService.publishDiff(controllerId, ( diff.map(d => TestsDiffOp.deserialize(this.uriIdentityService, d))));
    }
    async $runTests(req, token) {
        const result = await this.testService.runResolvedTests(req, token);
        return result.id;
    }
    async $getCoverageDetails(resultId, taskIndex, uri, token) {
        const details = await this.resultService.getResult(resultId)?.tasks[taskIndex]?.coverage.get()?.getUri(( URI.from(uri)))?.details(token);
        return details || [];
    }
    dispose() {
        super.dispose();
        for (const subscription of ( this.testProviderRegistrations.values())) {
            subscription.disposable.dispose();
        }
        this.testProviderRegistrations.clear();
    }
    withLiveRun(runId, fn) {
        const r = this.resultService.getResult(runId);
        return r && r instanceof LiveTestResult ? fn(r) : undefined;
    }
};
MainThreadTesting = __decorate([extHostNamedCustomer(MainContext.MainThreadTesting), ( __param(1, IUriIdentityService)), ( __param(2, ITestService)), ( __param(3, ITestProfileService)), ( __param(4, ITestResultService))], MainThreadTesting);

export { MainThreadTesting };
