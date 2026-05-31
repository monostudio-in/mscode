import { RawContextKey } from "../../contextkey/common/contextkey.js";
export declare enum AccessibilitySupport {
    /**
     * This should be the browser case where it is not known if a screen reader is attached or no.
     */
    Unknown = 0,
    Disabled = 1,
    Enabled = 2
}
export declare const CONTEXT_ACCESSIBILITY_MODE_ENABLED: RawContextKey<boolean>;
export interface IAccessibilityInformation {
    label: string;
    role?: string;
}
export declare function isAccessibilityInformation(obj: unknown): obj is IAccessibilityInformation;
export declare const ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = "ACCESSIBLE_VIEW_SHOWN_";
