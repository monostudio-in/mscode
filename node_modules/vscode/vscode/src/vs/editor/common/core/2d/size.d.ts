import { IDimension } from "./dimension.js";
export declare class Size2D {
    readonly width: number;
    readonly height: number;
    static equals(a: Size2D, b: Size2D): boolean;
    constructor(width: number, height: number);
    add(other: Size2D): Size2D;
    deltaX(delta: number): Size2D;
    deltaY(delta: number): Size2D;
    toString(): string;
    subtract(other: Size2D): Size2D;
    scale(factor: number): Size2D;
    scaleWidth(factor: number): Size2D;
    mapComponents(map: (value: number) => number): Size2D;
    isZero(): boolean;
    transpose(): Size2D;
    toDimension(): IDimension;
}
