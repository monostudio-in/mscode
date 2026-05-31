import { Disposable } from "../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IQuickAccessController, IQuickAccessOptions } from "../common/quickAccess.js";
import { IQuickPickItem } from "../common/quickInput.js";
import { IQuickInputService } from "../common/quickInput.service.js";
export declare class QuickAccessController extends Disposable implements IQuickAccessController {
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly registry;
    private readonly mapProviderToDescriptor;
    private readonly lastAcceptedPickerValues;
    private visibleQuickAccess;
    constructor(quickInputService: IQuickInputService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    pick(value?: string, options?: IQuickAccessOptions): Promise<IQuickPickItem[] | undefined>;
    show(value?: string, options?: IQuickAccessOptions): void;
    private doShowOrPick;
    private adjustValueSelection;
    private registerPickerListeners;
    private getOrInstantiateProvider;
}
