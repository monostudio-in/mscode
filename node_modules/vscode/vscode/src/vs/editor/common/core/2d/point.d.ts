export declare class Point {
    readonly x: number;
    readonly y: number;
    static equals(a: Point, b: Point): boolean;
    constructor(x: number, y: number);
    add(other: Point): Point;
    deltaX(delta: number): Point;
    deltaY(delta: number): Point;
    toString(): string;
    subtract(other: Point): Point;
    scale(factor: number): Point;
    mapComponents(map: (value: number) => number): Point;
    isZero(): boolean;
    withThreshold(threshold: number): Point;
}
