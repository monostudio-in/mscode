import { AccesibleViewContentProvider, IPosition, AccessibleViewProviderId, ICodeBlockActionContext } from "./accessibleView.js";
export declare const IAccessibleViewService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAccessibleViewService>;
export interface IAccessibleViewService {
    readonly _serviceBrand: undefined;
    show(provider: AccesibleViewContentProvider, position?: IPosition): void;
    showLastProvider(id: AccessibleViewProviderId): void;
    showAccessibleViewHelp(): void;
    next(): void;
    previous(): void;
    navigateToCodeBlock(type: "next" | "previous"): void;
    goToSymbol(): void;
    disableHint(): void;
    getPosition(id: AccessibleViewProviderId): IPosition | undefined;
    setPosition(position: IPosition, reveal?: boolean, select?: boolean): void;
    getLastPosition(): IPosition | undefined;
    /**
    * If the setting is enabled, provides the open accessible view hint as a localized string.
    * @param verbositySettingKey The setting key for the verbosity of the feature
    */
    getOpenAriaHint(verbositySettingKey: string): string | null;
    getCodeBlockContext(): ICodeBlockActionContext | undefined;
    configureKeybindings(unassigned: boolean): void;
    openHelpLink(): void;
}
