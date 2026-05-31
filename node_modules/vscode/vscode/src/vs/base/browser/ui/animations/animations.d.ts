import { ThemeIcon } from "../../../common/themables.js";
export declare enum ClickAnimation {
    Confetti = 1,
    FloatingIcons = 2,
    PulseWave = 3,
    RadiantLines = 4
}
/**
 * Bounce the element with a given scale and optional rotation.
 */
export declare function bounceElement(element: HTMLElement, opts: {
    scale?: number[];
    rotate?: number[];
    translateY?: number[];
    duration?: number;
}): void;
/**
 * Confetti: small particles burst outward in a circle from the element center,
 * with an expanding ring.
 */
export declare function triggerConfettiAnimation(element: HTMLElement): void;
/**
 * Floating Icons: small icons float upward from the element.
 */
export declare function triggerFloatingIconsAnimation(element: HTMLElement, icon: ThemeIcon): void;
/**
 * Pulse Wave: expanding rings and sparkle dots radiate from the element center.
 */
export declare function triggerPulseWaveAnimation(element: HTMLElement): void;
/**
 * Radiant Lines: lines and dots emanate outward from the element center.
 */
export declare function triggerRadiantLinesAnimation(element: HTMLElement): void;
/**
 * Triggers the specified click animation on the element.
 * @param element The target element to animate.
 * @param animation The type of click animation to trigger.
 * @param icon Optional icon for animations that require it (e.g., FloatingIcons).
 */
export declare function triggerClickAnimation(element: HTMLElement, animation: ClickAnimation, icon?: ThemeIcon): void;
