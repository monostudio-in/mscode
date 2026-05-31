import { Disposable } from "../../../base/common/lifecycle.js";
import { IHoverDelegate, IHoverDelegateOptions } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import type { IHoverOptions, IHoverWidget, IManagedHoverContentOrFactory } from "../../../base/browser/ui/hover/hover.js";
import { IHoverService } from "./hover.service.js";
export interface IHoverDelayOptions {
    readonly instantHover?: boolean;
    readonly dynamicDelay?: (content?: IManagedHoverContentOrFactory) => number | undefined;
}
export declare class WorkbenchHoverDelegate extends Disposable implements IHoverDelegate {
    readonly placement: "mouse" | "element";
    private readonly hoverOptions;
    private overrideOptions;
    private readonly configurationService;
    private readonly hoverService;
    private lastHoverHideTime;
    private timeLimit;
    private _delay;
    get delay(): number | ((content: IManagedHoverContentOrFactory) => number);
    private readonly hoverDisposables;
    constructor(placement: "mouse" | "element", hoverOptions: IHoverDelayOptions | undefined, overrideOptions: (Partial<IHoverOptions> | ((options: IHoverDelegateOptions, focus?: boolean) => Partial<IHoverOptions>)) | undefined, configurationService: IConfigurationService, hoverService: IHoverService);
    showHover(options: IHoverDelegateOptions, focus?: boolean): IHoverWidget | undefined;
    private isInstantlyHovering;
    setInstantHoverTimeLimit(timeLimit: number): void;
    onDidHideHover(): void;
}
export declare const nativeHoverDelegate: IHoverDelegate;
