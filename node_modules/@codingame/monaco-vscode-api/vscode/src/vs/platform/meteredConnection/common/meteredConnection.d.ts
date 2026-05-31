import { Disposable } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { IMeteredConnectionService } from "./meteredConnection.service.js";
export declare const METERED_CONNECTION_SETTING_KEY = "network.meteredConnection";
export type MeteredConnectionSettingValue = "on" | "off" | "auto";
/**
 * Network Information API
 * See https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 */
export interface NetworkInformation {
    saveData?: boolean;
    metered?: boolean;
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
}
/**
 * Extended Navigator interface for Network Information API
 */
export interface NavigatorWithConnection {
    readonly connection?: NetworkInformation;
}
/**
 * Check if the current network connection is metered according to the Network Information API.
 */
export declare function getIsBrowserConnectionMetered(): boolean;
/**
 * Abstract base class for metered connection services.
 */
export declare abstract class AbstractMeteredConnectionService extends Disposable implements IMeteredConnectionService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeIsConnectionMetered;
    readonly onDidChangeIsConnectionMetered: import("../../../base/common/event.js").Event<boolean>;
    private _isConnectionMetered;
    private _isBrowserConnectionMetered;
    private _meteredConnectionSetting;
    constructor(configurationService: IConfigurationService, isBrowserConnectionMetered: boolean);
    get isConnectionMetered(): boolean;
    protected get isBrowserConnectionMetered(): boolean;
    setIsBrowserConnectionMetered(value: boolean): void;
    protected onChangeBrowserConnection(): void;
    protected onUpdated(): void;
    protected onChangeIsConnectionMetered(): void;
}
