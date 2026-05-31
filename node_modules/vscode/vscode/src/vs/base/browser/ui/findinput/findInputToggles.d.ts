import { Toggle } from "../toggle/toggle.js";
import { type IHoverLifecycleOptions } from "../hover/hover.js";
export interface IFindInputToggleOpts {
    readonly appendTitle: string;
    readonly isChecked: boolean;
    readonly inputActiveOptionBorder: string | undefined;
    readonly inputActiveOptionForeground: string | undefined;
    readonly inputActiveOptionBackground: string | undefined;
    readonly hoverLifecycleOptions?: IHoverLifecycleOptions;
}
export declare class CaseSensitiveToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class WholeWordsToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class RegexToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
