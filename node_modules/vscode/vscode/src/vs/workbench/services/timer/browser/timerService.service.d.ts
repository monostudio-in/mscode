import * as perf from "../../../../base/common/performance.js";
import { IStartupMetrics } from "@codingame/monaco-vscode-lifecycle-service-override/vscode/vs/workbench/services/timer/browser/timerService";
export interface ITimerService {
    readonly _serviceBrand: undefined;
    /**
    * A promise that resolved when startup timings and perf marks
    * are available. This depends on lifecycle phases and extension
    * hosts being started.
    */
    whenReady(): Promise<boolean>;
    /**
    * A baseline performance indicator for this machine. The value will only available
    * late after startup because computing it takes away CPU resources
    *
    * NOTE that this returns -1 if the machine is hopelessly slow...
    */
    perfBaseline: Promise<number>;
    /**
    * Startup metrics. Can ONLY be accessed after `whenReady` has resolved.
    */
    readonly startupMetrics: IStartupMetrics;
    /**
    * Deliver performance marks from a source, like the main process or extension hosts.
    * The source argument acts as an identifier and therefore it must be unique.
    */
    setPerformanceMarks(source: string, marks: perf.PerformanceMark[]): void;
    /**
    * Get all currently known performance marks by source. There is no sorting of the
    * returned tuples but the marks of a tuple are guaranteed to be sorted by start times.
    */
    getPerformanceMarks(): [
        source: string,
        marks: readonly perf.PerformanceMark[]
    ][];
    /**
    * Return the duration between two marks.
    * @param from from mark name
    * @param to to mark name
    */
    getDuration(from: string, to: string): number;
    /**
    * Return the timestamp of a mark.
    * @param mark mark name
    */
    getStartTime(mark: string): number;
}
export declare const ITimerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITimerService>;
