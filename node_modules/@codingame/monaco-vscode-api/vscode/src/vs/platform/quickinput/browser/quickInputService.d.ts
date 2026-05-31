import { CancellationToken } from "../../../base/common/cancellation.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILayoutService } from "../../layout/browser/layoutService.service.js";
import { IQuickAccessController } from "../common/quickAccess.js";
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickInputButton, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickTree, IQuickTreeItem, IQuickWidget, QuickInputAlignment, QuickInputHideReason, QuickPickInput } from "../common/quickInput.js";
import { IQuickInputService } from "../common/quickInput.service.js";
import { Themable } from "../../theme/common/themeService.js";
import { IThemeService } from "../../theme/common/themeService.service.js";
import { IQuickInputOptions } from "./quickInput.js";
import { QuickInputController, IQuickInputControllerHost } from "./quickInputController.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { IObservable } from "../../../base/common/observable.js";
export declare class QuickInputService extends Themable implements IQuickInputService {
    private readonly instantiationService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly layoutService: ILayoutService;
    protected readonly configurationService: IConfigurationService;
    readonly _serviceBrand: undefined;
    get backButton(): IQuickInputButton;
    private readonly _alignment;
    readonly alignment: IObservable<QuickInputAlignment>;
    private readonly _onShow;
    readonly onShow: import("../../../base/common/event.js").Event<void>;
    private readonly _onHide;
    readonly onHide: import("../../../base/common/event.js").Event<void>;
    private _controller;
    private get controller();
    private get hasController();
    get currentQuickInput(): import("../common/quickInput.js").IQuickInput | undefined;
    private _quickAccess;
    get quickAccess(): IQuickAccessController;
    private readonly contexts;
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, layoutService: ILayoutService, configurationService: IConfigurationService);
    protected createController(host?: IQuickInputControllerHost, options?: Partial<IQuickInputOptions>): QuickInputController;
    private setContextKey;
    private resetContextKeys;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    createQuickTree<T extends IQuickTreeItem>(): IQuickTree<T>;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(reason?: QuickInputHideReason): Promise<void>;
    setAlignment(alignment: "top" | "center" | {
        top: number;
        left: number;
    }): void;
    toggleHover(): void;
    updateStyles(): void;
    private computeStyles;
}
