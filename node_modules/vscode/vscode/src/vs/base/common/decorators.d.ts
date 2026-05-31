export declare function memoize(_target: Object, key: string, descriptor: PropertyDescriptor): void;
export interface IDebounceReducer<T> {
    (previousValue: T, ...args: any[]): T;
}
export declare function debounce<T>(delay: number, reducer?: IDebounceReducer<T>, initialValueProvider?: () => T): MethodDecorator;
export declare function throttle<T>(delay: number, reducer?: IDebounceReducer<T>, initialValueProvider?: () => T): MethodDecorator;
export { cancelPreviousCalls } from "./decorators/cancelPreviousCalls.js";
