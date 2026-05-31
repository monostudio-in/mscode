import { type BrandedService, IInstantiationService } from "../vscode/src/vs/platform/instantiation/common/instantiation.js";
declare type GetLeadingNonServiceArgs<Args> = Args extends [
    ...BrandedService[]
] ? [
] : Args extends [
    infer A,
    ...BrandedService[]
] ? [
    A
] : Args extends [
    infer A,
    ...infer R
] ? [
    A,
    ...GetLeadingNonServiceArgs<R>
] : never;
/**
 * Takes a class with injected services as parameters and returns a child class that only takes the injector as parameter
 * @param ctor The class to inject
 * @returns A class that only needs the injector
 */
export declare function createInjectedClass<Ctor extends abstract new (...args: any[]) => InstanceType<Ctor>>(ctor: Ctor): new (instantiationService: IInstantiationService, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>) => InstanceType<Ctor>;
export {};
