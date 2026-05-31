import { Event } from "../../../../base/common/event.js";
import { IAuxiliaryWindowOpenEvent, IAuxiliaryWindowOpenOptions, IAuxiliaryWindow } from "./auxiliaryWindowService.js";
export declare const IAuxiliaryWindowService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuxiliaryWindowService>;
export interface IAuxiliaryWindowService {
    readonly _serviceBrand: undefined;
    readonly onDidOpenAuxiliaryWindow: Event<IAuxiliaryWindowOpenEvent>;
    open(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryWindow>;
    getWindow(windowId: number): IAuxiliaryWindow | undefined;
}
