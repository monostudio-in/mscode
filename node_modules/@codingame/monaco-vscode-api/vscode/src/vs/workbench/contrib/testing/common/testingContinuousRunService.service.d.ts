import { Event } from "../../../../base/common/event.js";
import { ITestRunProfile, TestRunProfileBitset } from "./testTypes.js";
export declare const ITestingContinuousRunService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestingContinuousRunService>;
export interface ITestingContinuousRunService {
    readonly _serviceBrand: undefined;
    /**
    * Gets a list of the last test profiles that were continuously run in the workspace.
    */
    readonly lastRunProfileIds: ReadonlySet<number>;
    /**
    * Fired when a test is added or removed from continuous run, or when
    * enablement is changed globally.
    */
    readonly onDidChange: Event<string | undefined>;
    /**
    * Gets whether continuous run is specifically enabled for the given test ID.
    */
    isSpecificallyEnabledFor(testId: string): boolean;
    /**
    * Gets whether continuous run is specifically enabled for
    * the given test ID, or any of its parents.
    */
    isEnabledForAParentOf(testId: string): boolean;
    /**
    * Gets whether continuous run is specifically enabled for
    * the given test ID, or any of its parents.
    */
    isEnabledForAChildOf(testId: string): boolean;
    /**
    * Gets whether continuous run is turned on for the given profile.
    */
    isEnabledForProfile(profile: ITestRunProfile): boolean;
    /**
    * Gets whether it's enabled at all.
    */
    isEnabled(): boolean;
    /**
    * Starts a continuous auto run with a specific set of profiles, or all
    * default profiles in a group. Globally if no test is given,
    * for a specific test otherwise.
    */
    start(profile: ITestRunProfile[] | TestRunProfileBitset, testId?: string): void;
    /**
    * Stops a continuous run for the given test profile.
    */
    stopProfile(profile: ITestRunProfile): void;
    /**
    * Stops any continuous run
    * Globally if no test is given, for a specific test otherwise.
    */
    stop(testId?: string): void;
}
