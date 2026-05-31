import { IActivityService } from "../../services/activity/common/activity.service.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { DisposableStore, Disposable } from "../../../base/common/lifecycle.js";
import { IColorTheme } from "../../../platform/theme/common/themeService.js";
import { IThemeService } from "../../../platform/theme/common/themeService.service.js";
import { IStorageService } from "../../../platform/storage/common/storage.service.js";
import { IExtensionService } from "../../services/extensions/common/extensions.service.js";
import { CompositeBarActionViewItem, CompositeBarAction, IActivityHoverOptions, ICompositeBarActionViewItemOptions, ICompositeBarColors } from "./compositeBarActions.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { IAction } from "../../../base/common/actions.js";
import { IMenu, MenuId } from "../../../platform/actions/common/actions.js";
import { IMenuService } from "../../../platform/actions/common/actions.service.js";
import { AnchorAlignment, AnchorAxisAlignment } from "../../../base/browser/ui/contextview/contextview.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.service.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.service.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.service.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.service.js";
import { ILogService } from "../../../platform/log/common/log.service.js";
import { IProductService } from "../../../platform/product/common/productService.service.js";
import { ISecretStorageService } from "../../../platform/secrets/common/secrets.service.js";
import { IAuthenticationService } from "../../services/authentication/common/authentication.service.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.service.js";
import { IHoverService } from "../../../platform/hover/browser/hover.service.js";
import { ILifecycleService } from "../../services/lifecycle/common/lifecycle.service.js";
import { IUserDataProfileService } from "../../services/userDataProfile/common/userDataProfile.service.js";
import { IBaseActionViewItemOptions } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { ICommandService } from "../../../platform/commands/common/commands.service.js";
export declare class GlobalCompositeBar extends Disposable {
    private readonly contextMenuActionsProvider;
    private readonly colors;
    private readonly activityHoverOptions;
    private readonly instantiationService;
    private readonly storageService;
    private readonly extensionService;
    private static readonly ACCOUNTS_ACTION_INDEX;
    static readonly ACCOUNTS_ICON: ThemeIcon;
    readonly element: HTMLElement;
    private readonly globalActivityAction;
    private readonly accountAction;
    private readonly globalActivityActionBar;
    constructor(contextMenuActionsProvider: () => IAction[], colors: (theme: IColorTheme) => ICompositeBarColors, activityHoverOptions: IActivityHoverOptions, configurationService: IConfigurationService, instantiationService: IInstantiationService, storageService: IStorageService, extensionService: IExtensionService);
    private registerListeners;
    create(parent: HTMLElement): void;
    focus(): void;
    size(): number;
    getContextMenuActions(): IAction[];
    private toggleAccountsActivity;
    private get accountsVisibilityPreference();
    private set accountsVisibilityPreference(value);
}
declare abstract class AbstractGlobalActivityActionViewItem extends CompositeBarActionViewItem {
    private readonly menuId;
    private readonly contextMenuActionsProvider;
    private readonly contextMenuAlignmentOptions;
    private readonly menuService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly activityService;
    constructor(menuId: MenuId, action: CompositeBarAction, options: ICompositeBarActionViewItemOptions, contextMenuActionsProvider: () => IAction[], contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService, activityService: IActivityService);
    private updateItemActivity;
    render(container: HTMLElement): void;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    private run;
    protected resolveMainMenuActions(menu: IMenu, _disposable: DisposableStore): Promise<IAction[]>;
}
export declare class AccountsActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    private readonly fillContextMenuActions;
    private readonly lifecycleService;
    private readonly authenticationService;
    private readonly productService;
    private readonly secretStorageService;
    private readonly logService;
    private readonly commandService;
    static readonly ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
    private readonly groupedAccounts;
    private readonly problematicProviders;
    private initialized;
    private sessionFromEmbedder;
    constructor(contextMenuActionsProvider: () => IAction[], options: ICompositeBarActionViewItemOptions, contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, fillContextMenuActions: (actions: IAction[]) => void, themeService: IThemeService, lifecycleService: ILifecycleService, hoverService: IHoverService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, authenticationService: IAuthenticationService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, configurationService: IConfigurationService, keybindingService: IKeybindingService, secretStorageService: ISecretStorageService, logService: ILogService, activityService: IActivityService, instantiationService: IInstantiationService, commandService: ICommandService);
    private registerListeners;
    private initialize;
    private doInitialize;
    protected resolveMainMenuActions(accountsMenu: IMenu, disposables: DisposableStore): Promise<IAction[]>;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    private addOrUpdateAccount;
    private removeAccount;
    private addAccountsFromProvider;
}
export declare class GlobalActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    private readonly userDataProfileService;
    private profileBadge;
    private profileBadgeContent;
    constructor(contextMenuActionsProvider: () => IAction[], options: ICompositeBarActionViewItemOptions, contextMenuAlignmentOptions: () => Readonly<{
        anchorAlignment: AnchorAlignment;
        anchorAxisAlignment: AnchorAxisAlignment;
    }> | undefined, userDataProfileService: IUserDataProfileService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, activityService: IActivityService);
    render(container: HTMLElement): void;
    private updateProfileBadge;
    protected updateActivity(): void;
    protected computeTitle(): string;
}
export declare class SimpleAccountActivityActionViewItem extends AccountsActivityActionViewItem {
    constructor(hoverOptions: IActivityHoverOptions, options: IBaseActionViewItemOptions, themeService: IThemeService, lifecycleService: ILifecycleService, hoverService: IHoverService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, authenticationService: IAuthenticationService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, configurationService: IConfigurationService, keybindingService: IKeybindingService, secretStorageService: ISecretStorageService, storageService: IStorageService, logService: ILogService, activityService: IActivityService, instantiationService: IInstantiationService, commandService: ICommandService);
}
export declare class SimpleGlobalActivityActionViewItem extends GlobalActivityActionViewItem {
    constructor(hoverOptions: IActivityHoverOptions, options: IBaseActionViewItemOptions, userDataProfileService: IUserDataProfileService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, activityService: IActivityService, storageService: IStorageService);
}
export declare function isAccountsActionVisible(storageService: IStorageService): boolean;
export {};
