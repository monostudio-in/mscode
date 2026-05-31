import { URI } from "../../../../base/common/uri.js";
export interface ChecksumPair {
    uri: URI;
    actual: string;
    expected: string;
    isPure: boolean;
}
export interface IntegrityTestResult {
    isPure: boolean;
    proof: ChecksumPair[];
}
