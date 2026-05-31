import { IBannerItem } from "./bannerService.js";
export declare const IBannerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBannerService>;
export interface IBannerService {
    readonly _serviceBrand: undefined;
    focus(): void;
    focusNextAction(): void;
    focusPreviousAction(): void;
    hide(id: string): void;
    show(item: IBannerItem): void;
}
