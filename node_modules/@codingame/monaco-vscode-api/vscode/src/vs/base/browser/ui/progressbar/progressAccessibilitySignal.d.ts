import { IDisposable } from "../../../common/lifecycle.js";
export interface IScopedAccessibilityProgressSignalDelegate extends IDisposable {
}
export declare function setProgressAccessibilitySignalScheduler(progressAccessibilitySignalScheduler: (msDelayTime: number, msLoopTime?: number) => IScopedAccessibilityProgressSignalDelegate): void;
export declare function getProgressAccessibilitySignalScheduler(msDelayTime: number, msLoopTime?: number): IScopedAccessibilityProgressSignalDelegate;
