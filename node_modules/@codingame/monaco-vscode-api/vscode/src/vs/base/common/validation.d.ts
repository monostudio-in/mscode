import { IJSONSchema } from "./jsonSchema.js";
export interface IValidator<T> {
    validate(content: unknown): {
        content: T;
        error: undefined;
    } | {
        content: undefined;
        error: ValidationError;
    };
    getJSONSchema(): IJSONSchema;
}
export declare abstract class ValidatorBase<T> implements IValidator<T> {
    abstract validate(content: unknown): {
        content: T;
        error: undefined;
    } | {
        content: undefined;
        error: ValidationError;
    };
    abstract getJSONSchema(): IJSONSchema;
    validateOrThrow(content: unknown): T;
}
export type ValidatorType<T> = T extends IValidator<infer U> ? U : never;
export interface ValidationError {
    message: string;
}
export declare function vString(): ValidatorBase<string>;
export declare function vNumber(): ValidatorBase<number>;
export declare function vBoolean(): ValidatorBase<boolean>;
export declare function vObjAny(): ValidatorBase<object>;
export declare function vUnchecked<T>(): ValidatorBase<T>;
export declare function vUndefined(): ValidatorBase<undefined>;
export declare function vUnknown(): ValidatorBase<unknown>;
export type ObjectProperties = Record<string, unknown>;
export declare class Optional<T extends IValidator<unknown>> {
    readonly validator: T;
    constructor(validator: T);
}
export declare function vOptionalProp<T>(validator: IValidator<T>): Optional<IValidator<T>>;
type ExtractOptionalKeys<T> = {
    [K in keyof T]: T[K] extends Optional<IValidator<unknown>> ? K : never;
}[keyof T];
type ExtractRequiredKeys<T> = {
    [K in keyof T]: T[K] extends Optional<IValidator<unknown>> ? never : K;
}[keyof T];
export type vObjType<T extends Record<string, IValidator<unknown> | Optional<IValidator<unknown>>>> = {
    [K in ExtractRequiredKeys<T>]: T[K] extends IValidator<infer U> ? U : never;
} & {
    [K in ExtractOptionalKeys<T>]?: T[K] extends Optional<IValidator<infer U>> ? U : never;
};
export declare function vObj<T extends Record<string, IValidator<unknown> | Optional<IValidator<unknown>>>>(properties: T): ValidatorBase<vObjType<T>>;
export declare function vArray<T>(validator: IValidator<T>): ValidatorBase<T[]>;
type vTupleType<T extends IValidator<unknown>[]> = {
    [K in keyof T]: ValidatorType<T[K]>;
};
export declare function vTuple<T extends IValidator<unknown>[]>(...validators: T): ValidatorBase<vTupleType<T>>;
export declare function vUnion<T extends IValidator<unknown>[]>(...validators: T): ValidatorBase<ValidatorType<T[number]>>;
export declare function vEnum<T extends string[]>(...values: T): ValidatorBase<T[number]>;
export declare function vLiteral<T extends string>(value: T): ValidatorBase<T>;
export declare function vLazy<T>(fn: () => IValidator<T>): ValidatorBase<T>;
export declare function vWithJsonSchemaRef<T>(ref: string, validator: IValidator<T>): ValidatorBase<T>;
export {};
