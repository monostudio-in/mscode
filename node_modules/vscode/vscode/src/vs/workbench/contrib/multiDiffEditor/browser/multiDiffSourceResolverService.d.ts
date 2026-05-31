import { IValueWithChangeEvent } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ContextKeyValue } from "../../../../platform/contextkey/common/contextkey.js";
import { IMultiDiffSourceResolverService } from "./multiDiffSourceResolverService.service.js";
export interface IMultiDiffSourceResolver {
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(uri: URI): Promise<IResolvedMultiDiffSource>;
}
export interface IResolvedMultiDiffSource {
    readonly resources: IValueWithChangeEvent<readonly MultiDiffEditorItem[]>;
    readonly contextKeys?: Record<string, ContextKeyValue>;
}
export declare class MultiDiffEditorItem {
    readonly originalUri: URI | undefined;
    readonly modifiedUri: URI | undefined;
    readonly goToFileUri: URI | undefined;
    readonly goToFileEditorTitle?: string | undefined;
    readonly contextKeys?: Record<string, ContextKeyValue> | undefined;
    constructor(originalUri: URI | undefined, modifiedUri: URI | undefined, goToFileUri: URI | undefined, goToFileEditorTitle?: string | undefined, contextKeys?: Record<string, ContextKeyValue> | undefined);
    getKey(): string;
}
export declare class MultiDiffSourceResolverService implements IMultiDiffSourceResolverService {
    readonly _serviceBrand: undefined;
    private readonly _resolvers;
    registerResolver(resolver: IMultiDiffSourceResolver): IDisposable;
    resolve(uri: URI): Promise<IResolvedMultiDiffSource | undefined>;
}
