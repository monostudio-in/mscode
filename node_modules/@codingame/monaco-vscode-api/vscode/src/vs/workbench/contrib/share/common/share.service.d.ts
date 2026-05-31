import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ISubmenuItem } from "../../../../platform/actions/common/actions.js";
import { IShareProvider, IShareableItem } from "./share.js";
export declare const IShareService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IShareService>;
export interface IShareService {
    _serviceBrand: undefined;
    registerShareProvider(provider: IShareProvider): IDisposable;
    getShareActions(): ISubmenuItem[];
    provideShare(item: IShareableItem, token: CancellationToken): Thenable<URI | string | undefined>;
}
