import { CancellationToken } from "./cancellation.js";
import { Event } from "./event.js";
/**
 * A Pager is a stateless abstraction over a paged collection.
 */
export interface IPager<T> {
    firstPage: T[];
    total: number;
    pageSize: number;
    getPage(pageIndex: number, cancellationToken: CancellationToken): Promise<T[]>;
}
export interface IIterativePage<T> {
    readonly items: T[];
    readonly hasMore: boolean;
}
export interface IIterativePager<T> {
    readonly firstPage: IIterativePage<T>;
    getNextPage(cancellationToken: CancellationToken): Promise<IIterativePage<T>>;
}
export interface IPageIterator<T> {
    elements: T[];
    total: number;
    hasNextPage: boolean;
    getNextPage(cancellationToken: CancellationToken): Promise<IPageIterator<T>>;
}
/**
 * A PagedModel is a stateful model over an abstracted paged collection.
 */
export interface IPagedModel<T> {
    readonly length: number;
    readonly onDidIncrementLength: Event<number>;
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
export declare function singlePagePager<T>(elements: T[]): IPager<T>;
export declare class PagedModel<T> implements IPagedModel<T> {
    private pager;
    private pages;
    get length(): number;
    readonly onDidIncrementLength: Event<any>;
    constructor(arg: IPager<T> | T[]);
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
export declare class DelayedPagedModel<T> implements IPagedModel<T> {
    private readonly model;
    private timeout;
    get length(): number;
    get onDidIncrementLength(): Event<number>;
    constructor(model: IPagedModel<T>, timeout?: number);
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
/**
 * A PageIteratorPager wraps an IPageIterator to provide IPager functionality.
 * It caches pages as they are accessed and supports random page access by
 * sequentially loading pages until the requested page is reached.
 */
export declare class PageIteratorPager<T> implements IPager<T> {
    private cachedPages;
    private currentIterator;
    private isComplete;
    private pendingRequests;
    readonly firstPage: T[];
    readonly pageSize: number;
    readonly total: number;
    constructor(initialIterator: IPageIterator<T>);
    getPage(pageIndex: number, cancellationToken: CancellationToken): Promise<T[]>;
    private loadPagesUntil;
}
export declare class IterativePagedModel<T> implements IPagedModel<T> {
    private items;
    private _hasNextPage;
    private readonly _onDidIncrementLength;
    private loadingPromise;
    private readonly pager;
    constructor(pager: IIterativePager<T>);
    get onDidIncrementLength(): Event<number>;
    /**
     * Returns actual length + 1 if there are more pages (sentinel approach)
     */
    get length(): number;
    /**
     * Sentinel item is never resolved - it triggers loading
     */
    isResolved(index: number): boolean;
    get(index: number): T;
    /**
     * When sentinel item is accessed, load next page
     */
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
    private loadNextPage;
    dispose(): void;
}
/**
 * Similar to array.map, `mapPager` lets you map the elements of an
 * abstract paged collection to another type.
 */
export declare function mapPager<T, R>(pager: IPager<T>, fn: (t: T) => R): IPager<R>;
