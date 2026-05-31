export interface IFlexBoxPartGrowthRule extends IFlexBoxPartExtensionRule {
    min?: number;
    rules?: IFlexBoxPartExtensionRule[];
}
export interface IFlexBoxPartExtensionRule {
    max?: number;
    priority?: number;
    share?: number;
}
/**
 * Distributes a total size into parts that each have a list of growth rules.
 * Returns `null` if the layout is not possible.
 * The sum of all returned sizes will be equal to `totalSize`.
 *
 * First, each part gets its minimum size.
 * Then, remaining space is distributed to the rules with the highest priority, as long as the max constraint allows it (considering share).
 * This continues with next lower priority rules until no space is left.
*/
export declare function distributeFlexBoxLayout<T extends Record<string, IFlexBoxPartGrowthRule | IFlexBoxPartGrowthRule[]>>(totalSize: number, parts: T & Record<string, IFlexBoxPartGrowthRule | IFlexBoxPartGrowthRule[]>): Record<keyof T, number> | null;
