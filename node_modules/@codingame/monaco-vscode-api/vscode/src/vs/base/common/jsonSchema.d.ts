export type JSONSchemaType = "string" | "number" | "integer" | "boolean" | "null" | "array" | "object";
export interface IJSONSchema {
    id?: string;
    $id?: string;
    $schema?: string;
    type?: JSONSchemaType | JSONSchemaType[];
    title?: string;
    default?: any;
    definitions?: IJSONSchemaMap;
    description?: string;
    properties?: IJSONSchemaMap;
    patternProperties?: IJSONSchemaMap;
    additionalProperties?: boolean | IJSONSchema;
    minProperties?: number;
    maxProperties?: number;
    dependencies?: IJSONSchemaMap | {
        [prop: string]: string[];
    };
    items?: IJSONSchema | IJSONSchema[];
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    additionalItems?: boolean | IJSONSchema;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    multipleOf?: number;
    required?: string[];
    $ref?: string;
    anyOf?: IJSONSchema[];
    allOf?: IJSONSchema[];
    oneOf?: IJSONSchema[];
    not?: IJSONSchema;
    enum?: any[];
    format?: string;
    const?: any;
    contains?: IJSONSchema;
    propertyNames?: IJSONSchema;
    examples?: any[];
    $comment?: string;
    if?: IJSONSchema;
    then?: IJSONSchema;
    else?: IJSONSchema;
    unevaluatedProperties?: boolean | IJSONSchema;
    unevaluatedItems?: boolean | IJSONSchema;
    minContains?: number;
    maxContains?: number;
    deprecated?: boolean;
    dependentRequired?: {
        [prop: string]: string[];
    };
    dependentSchemas?: IJSONSchemaMap;
    $defs?: {
        [name: string]: IJSONSchema;
    };
    $anchor?: string;
    $recursiveRef?: string;
    $recursiveAnchor?: string;
    $vocabulary?: any;
    prefixItems?: IJSONSchema[];
    $dynamicRef?: string;
    $dynamicAnchor?: string;
    defaultSnippets?: IJSONSchemaSnippet[];
    errorMessage?: string;
    patternErrorMessage?: string;
    deprecationMessage?: string;
    markdownDeprecationMessage?: string;
    enumDescriptions?: string[];
    markdownEnumDescriptions?: string[];
    markdownDescription?: string;
    doNotSuggest?: boolean;
    suggestSortText?: string;
    allowComments?: boolean;
    allowTrailingCommas?: boolean;
    secret?: boolean;
}
export interface IJSONSchemaMap {
    [name: string]: IJSONSchema;
}
export interface IJSONSchemaSnippet {
    label?: string;
    description?: string;
    body?: any;
    bodyText?: string;
}
/**
 * Converts a basic JSON schema to a TypeScript type.
 */
export type TypeFromJsonSchema<T> = T extends {
    enum: infer EnumValues;
} ? UnionOf<EnumValues> : T extends {
    type: "object";
    properties: infer P;
    required: infer RequiredList;
} ? {
    [K in keyof P]: IsRequired<K, RequiredList> extends true ? TypeFromJsonSchema<P[K]> : TypeFromJsonSchema<P[K]> | undefined;
} & AdditionalPropertiesType<T> : T extends {
    type: "object";
    properties: infer P;
} ? {
    [K in keyof P]: TypeFromJsonSchema<P[K]> | undefined;
} & AdditionalPropertiesType<T> : T extends {
    type: "array";
    items: infer Items;
} ? Items extends [
    ...infer R
] ? {
    [K in keyof R]: TypeFromJsonSchema<Items[K]>;
} : Array<TypeFromJsonSchema<Items>> : T extends {
    oneOf: infer I;
} ? MapSchemaToType<I> : T extends {
    anyOf: infer I;
} ? MapSchemaToType<I> : T extends {
    type: infer Type;
} ? Type extends "string" | "number" | "integer" | "boolean" | "null" ? SchemaPrimitiveTypeNameToType<Type> : Type extends [
    ...infer R
] ? UnionOf<{
    [K in keyof R]: SchemaPrimitiveTypeNameToType<R[K]>;
}> : never : never;
type SchemaPrimitiveTypeNameToType<T> = T extends "string" ? string : T extends "number" | "integer" ? number : T extends "boolean" ? boolean : T extends "null" ? null : never;
type UnionOf<T> = T extends [
    infer First,
    ...infer Rest
] ? First | UnionOf<Rest> : never;
type IsRequired<K, RequiredList> = RequiredList extends [
] ? false : RequiredList extends [
    K,
    ...infer _
] ? true : RequiredList extends [
    infer _,
    ...infer R
] ? IsRequired<K, R> : false;
type AdditionalPropertiesType<Schema> = Schema extends {
    additionalProperties: infer AP;
} ? AP extends false ? {} : {
    [key: string]: TypeFromJsonSchema<Schema["additionalProperties"]>;
} : {};
type MapSchemaToType<T> = T extends [
    infer First,
    ...infer Rest
] ? TypeFromJsonSchema<First> | MapSchemaToType<Rest> : never;
export declare function getCompressedContent(schema: IJSONSchema): string;
export {};
