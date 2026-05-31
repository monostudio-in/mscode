import { IStringDictionary } from "../../../base/common/collections.js";
import { Event } from "../../../base/common/event.js";
import { PolicyName } from "../../../base/common/policy.js";
import { PolicyDefinition, PolicyValue } from "./policy.js";
export declare const IPolicyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IPolicyService>;
export interface IPolicyService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<readonly PolicyName[]>;
    updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<IStringDictionary<PolicyValue>>;
    getPolicyValue(name: PolicyName): PolicyValue | undefined;
    serialize(): IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }> | undefined;
    readonly policyDefinitions: IStringDictionary<PolicyDefinition>;
}
