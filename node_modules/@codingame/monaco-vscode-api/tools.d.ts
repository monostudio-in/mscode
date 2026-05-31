export declare function unsupported(): never;
export declare const noop: () => void;
export declare function memoized<A extends unknown[], T>(fct: (...args: A) => T): (...args: A) => T;
export declare function memoizedConstructor<T>(ctor: new (...args: any[]) => T): new (...args: unknown[]) => T;
export declare function sleep(duration: number): Promise<void>;
export declare function throttle<T>(fct: (param: T) => Promise<void>, merge: (a: T, b: T) => T, delay: number): (param: T) => Promise<void>;
