
import { range } from './arrays.js';
import { CancellationTokenSource } from './cancellation.js';
import { CancellationError } from './errors.js';
import { Event, Emitter } from './event.js';

function createPage(elements) {
    return {
        isResolved: !!elements,
        promise: null,
        cts: null,
        promiseIndexes: ( new Set()),
        elements: elements || []
    };
}
function singlePagePager(elements) {
    return {
        firstPage: elements,
        total: elements.length,
        pageSize: elements.length,
        getPage: (pageIndex, cancellationToken) => {
            return Promise.resolve(elements);
        }
    };
}
class PagedModel {
    get length() {
        return this.pager.total;
    }
    constructor(arg) {
        this.pages = [];
        this.onDidIncrementLength = Event.None;
        this.pager = Array.isArray(arg) ? singlePagePager(arg) : arg;
        const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
        this.pages = [createPage(this.pager.firstPage.slice()), ...( range(totalPages - 1).map(() => createPage()))];
    }
    isResolved(index) {
        const pageIndex = Math.floor(index / this.pager.pageSize);
        const page = this.pages[pageIndex];
        return !!page.isResolved;
    }
    get(index) {
        const pageIndex = Math.floor(index / this.pager.pageSize);
        const indexInPage = index % this.pager.pageSize;
        const page = this.pages[pageIndex];
        return page.elements[indexInPage];
    }
    resolve(index, cancellationToken) {
        if (cancellationToken.isCancellationRequested) {
            return Promise.reject(( new CancellationError()));
        }
        const pageIndex = Math.floor(index / this.pager.pageSize);
        const indexInPage = index % this.pager.pageSize;
        const page = this.pages[pageIndex];
        if (page.isResolved) {
            return Promise.resolve(page.elements[indexInPage]);
        }
        if (!page.promise) {
            page.cts = ( new CancellationTokenSource());
            page.promise = this.pager.getPage(pageIndex, page.cts.token).then(elements => {
                page.elements = elements;
                page.isResolved = true;
                page.promise = null;
                page.cts = null;
            }, err => {
                page.isResolved = false;
                page.promise = null;
                page.cts = null;
                return Promise.reject(err);
            });
        }
        const listener = cancellationToken.onCancellationRequested(() => {
            if (!page.cts) {
                return;
            }
            page.promiseIndexes.delete(index);
            if (page.promiseIndexes.size === 0) {
                page.cts.cancel();
            }
        });
        page.promiseIndexes.add(index);
        return page.promise.then(() => page.elements[indexInPage]).finally(() => listener.dispose());
    }
}
class DelayedPagedModel {
    get length() {
        return this.model.length;
    }
    get onDidIncrementLength() {
        return this.model.onDidIncrementLength;
    }
    constructor(model, timeout = 500) {
        this.model = model;
        this.timeout = timeout;
    }
    isResolved(index) {
        return this.model.isResolved(index);
    }
    get(index) {
        return this.model.get(index);
    }
    resolve(index, cancellationToken) {
        return ( new Promise((c, e) => {
            if (cancellationToken.isCancellationRequested) {
                return e(( new CancellationError()));
            }
            const timer = setTimeout(() => {
                if (cancellationToken.isCancellationRequested) {
                    return e(( new CancellationError()));
                }
                timeoutCancellation.dispose();
                this.model.resolve(index, cancellationToken).then(c, e);
            }, this.timeout);
            const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
                clearTimeout(timer);
                timeoutCancellation.dispose();
                e(( new CancellationError()));
            });
        }));
    }
}
class IterativePagedModel {
    constructor(pager) {
        this.items = [];
        this._hasNextPage = true;
        this._onDidIncrementLength = ( new Emitter());
        this.loadingPromise = null;
        this.pager = pager;
        this.items = [...pager.firstPage.items];
        this._hasNextPage = pager.firstPage.hasMore;
    }
    get onDidIncrementLength() {
        return this._onDidIncrementLength.event;
    }
    get length() {
        return this.items.length + (this._hasNextPage ? 1 : 0);
    }
    isResolved(index) {
        if (index === this.items.length && this._hasNextPage) {
            return false;
        }
        return index < this.items.length;
    }
    get(index) {
        if (index < this.items.length) {
            return this.items[index];
        }
        throw ( new Error("Item not resolved yet"));
    }
    async resolve(index, cancellationToken) {
        if (cancellationToken.isCancellationRequested) {
            return Promise.reject(( new CancellationError()));
        }
        if (index === this.items.length && this._hasNextPage) {
            await this.loadNextPage(cancellationToken);
        }
        if (index < this.items.length) {
            return this.items[index];
        }
        throw ( new Error("Index out of bounds"));
    }
    async loadNextPage(cancellationToken) {
        if (!this._hasNextPage) {
            return;
        }
        if (this.loadingPromise) {
            await this.loadingPromise;
            return;
        }
        const pagePromise = this.pager.getNextPage(cancellationToken);
        this.loadingPromise = pagePromise.then(page => {
            this.items.push(...page.items);
            this._hasNextPage = page.hasMore;
            this.loadingPromise = null;
            this._onDidIncrementLength.fire(this.length);
        }, err => {
            this.loadingPromise = null;
            throw err;
        });
        await this.loadingPromise;
    }
    dispose() {
        this._onDidIncrementLength.dispose();
    }
}

export { DelayedPagedModel, IterativePagedModel, PagedModel, singlePagePager };
