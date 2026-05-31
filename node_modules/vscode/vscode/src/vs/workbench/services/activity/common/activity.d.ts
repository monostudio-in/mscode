import { Color } from "../../../../base/common/color.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IColorTheme } from "../../../../platform/theme/common/themeService.js";
export interface IActivity {
    readonly badge: IBadge;
}
export interface IBadge {
    getDescription(): string;
    getColors(theme: IColorTheme): IBadgeStyles | undefined;
}
export interface IBadgeStyles {
    readonly badgeBackground: Color | undefined;
    readonly badgeForeground: Color | undefined;
    readonly badgeBorder: Color | undefined;
}
declare class BaseBadge<T = unknown> implements IBadge {
    protected readonly descriptorFn: (arg: T) => string;
    private readonly stylesFn;
    constructor(descriptorFn: (arg: T) => string, stylesFn: ((theme: IColorTheme) => IBadgeStyles | undefined) | undefined);
    getDescription(): string;
    getColors(theme: IColorTheme): IBadgeStyles | undefined;
}
export declare class NumberBadge extends BaseBadge<number> {
    readonly number: number;
    constructor(number: number, descriptorFn: (num: number) => string);
    getDescription(): string;
}
export declare class IconBadge extends BaseBadge<void> {
    readonly icon: ThemeIcon;
    constructor(icon: ThemeIcon, descriptorFn: () => string, stylesFn?: (theme: IColorTheme) => IBadgeStyles | undefined);
}
export declare class ProgressBadge extends BaseBadge<void> {
    constructor(descriptorFn: () => string);
}
export declare class WarningBadge extends IconBadge {
    constructor(descriptorFn: () => string);
}
export declare class ErrorBadge extends IconBadge {
    constructor(descriptorFn: () => string);
}
export {};
