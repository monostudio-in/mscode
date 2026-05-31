import { Event } from "../../../base/common/event.js";
import { AccessibilitySupport } from "./accessibility.js";
export declare const IAccessibilityService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAccessibilityService>;
export interface IAccessibilityService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeScreenReaderOptimized: Event<void>;
    readonly onDidChangeReducedMotion: Event<void>;
    readonly onDidChangeReducedTransparency: Event<void>;
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    isScreenReaderOptimized(): boolean;
    isMotionReduced(): boolean;
    isTransparencyReduced(): boolean;
    getAccessibilitySupport(): AccessibilitySupport;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
    alert(message: string): void;
    status(message: string): void;
}
