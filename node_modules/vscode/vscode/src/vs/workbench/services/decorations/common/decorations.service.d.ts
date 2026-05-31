import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IResourceDecorationChangeEvent, IDecorationsProvider, IDecoration } from "./decorations.js";
export declare const IDecorationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDecorationsService>;
export interface IDecorationsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDecorations: Event<IResourceDecorationChangeEvent>;
    registerDecorationsProvider(provider: IDecorationsProvider): IDisposable;
    getDecoration(uri: URI, includeChildren: boolean): IDecoration | undefined;
}
