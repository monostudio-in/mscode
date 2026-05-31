export declare const mark: (name: string, markOptions?: {
    startTime?: number;
}) => void;
/**
 * Clears performance marks. If a name is given, only marks with that exact
 * name are removed. If no name is given, all marks are removed.
 */
export declare const clearMarks: (name?: string) => void;
export interface PerformanceMark {
    readonly name: string;
    readonly startTime: number;
}
/**
 * Returns all marks, sorted by `startTime`.
 */
export declare const getMarks: () => PerformanceMark[];
