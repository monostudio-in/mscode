type TrustedTypePolicyOptions = import("trusted-types/lib/index.js").TrustedTypePolicyOptions;
export declare function createTrustedTypesPolicy<Options extends TrustedTypePolicyOptions>(policyName: string, policyOptions?: Options): undefined | Pick<TrustedTypePolicy, "name" | Extract<keyof Options, keyof TrustedTypePolicyOptions>>;
export {};
