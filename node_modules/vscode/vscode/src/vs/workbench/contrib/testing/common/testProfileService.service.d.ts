import { Event } from "../../../../base/common/event.js";
import { IMainThreadTestController } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testService";
import { ITestRunProfile, ITestItem, TestRunProfileBitset, InternalTestItem } from "./testTypes.js";
export declare const ITestProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestProfileService>;
export interface ITestProfileService {
    readonly _serviceBrand: undefined;
    /**
    * Fired when any profile changes.
    */
    readonly onDidChange: Event<void>;
    /**
    * Publishes a new test profile.
    */
    addProfile(controller: IMainThreadTestController, profile: ITestRunProfile): void;
    /**
    * Updates an existing test run profile
    */
    updateProfile(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    /**
    * Removes a profile. If profileId is not given, all profiles
    * for the given controller will be removed.
    */
    removeProfile(controllerId: string, profileId?: number): void;
    /**
    * Gets capabilities for the given test, indicating whether
    * there's any usable profiles available for those groups.
    * @returns a bitset to use with {@link TestRunProfileBitset}
    */
    capabilitiesForTest(test: ITestItem): number;
    /**
    * Configures a test profile.
    */
    configure(controllerId: string, profileId: number): void;
    /**
    * Gets all registered controllers, grouping by controller.
    */
    all(): Iterable<Readonly<{
        controller: IMainThreadTestController;
        profiles: ITestRunProfile[];
    }>>;
    /**
    * Gets the default profiles to be run for a given run group.
    */
    getGroupDefaultProfiles(group: TestRunProfileBitset, controllerId?: string): ITestRunProfile[];
    /**
    * Sets the default profiles to be run for a given run group.
    */
    setGroupDefaultProfiles(group: TestRunProfileBitset, profiles: ITestRunProfile[]): void;
    /**
    * Gets the profiles for a controller, in priority order.
    */
    getControllerProfiles(controllerId: string): ITestRunProfile[];
    /**
    * Gets the preferred profile, if any, to run the test.
    */
    getDefaultProfileForTest(group: TestRunProfileBitset, test: InternalTestItem): ITestRunProfile | undefined;
}
