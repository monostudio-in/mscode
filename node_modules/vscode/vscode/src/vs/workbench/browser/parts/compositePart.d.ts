import { Emitter } from "../../../base/common/event.js";
import { IActionViewItem } from "../../../base/browser/ui/actionbar/actionbar.js";
import { IAction } from "../../../base/common/actions.js";
import { Part, IPartOptions } from "../part.js";
import { Composite, CompositeRegistry } from "../composite.js";
import { IComposite } from "../../common/composite.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.service.js";
import { IStorageService } from "../../../platform/storage/common/storage.service.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.service.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IProgressIndicator } from "../../../platform/progress/common/progress.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.service.js";
import { IThemeService } from "../../../platform/theme/common/themeService.service.js";
import { INotificationService } from "../../../platform/notification/common/notification.service.js";
import { AnchorAlignment } from "../../../base/browser/ui/contextview/contextview.js";
import { WorkbenchToolBar } from "../../../platform/actions/browser/toolbar.js";
import { IBoundarySashes } from "../../../base/browser/ui/sash/sash.js";
import { IBaseActionViewItemOptions } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IHoverService } from "../../../platform/hover/browser/hover.service.js";
export interface ICompositeTitleLabel {
    /**
     * Asks to update the title for the composite with the given ID.
     */
    updateTitle(id: string, title: string, keybinding?: string): void;
    /**
     * Called when theming information changes.
     */
    updateStyles(): void;
}
export interface ICompositePartOptions extends IPartOptions {
    readonly trailingSeparator?: boolean;
}
export declare abstract class CompositePart<T extends Composite, MementoType extends object = object> extends Part<MementoType> {
    private readonly notificationService;
    protected readonly storageService: IStorageService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    private readonly hoverService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly registry: CompositeRegistry<T>;
    private readonly activeCompositeSettingsKey;
    private readonly defaultCompositeId;
    protected readonly nameForTelemetry: string;
    private readonly compositeCSSClass;
    private readonly titleForegroundColor;
    private readonly titleBorderColor;
    protected readonly onDidCompositeOpen: Emitter<{
        composite: IComposite;
        focus: boolean;
    }>;
    protected readonly onDidCompositeClose: Emitter<IComposite>;
    protected toolBar: WorkbenchToolBar | undefined;
    protected titleLabelElement: HTMLElement | undefined;
    protected readonly toolbarHoverDelegate: IHoverDelegate;
    private readonly mapCompositeToCompositeContainer;
    private readonly mapActionsBindingToComposite;
    private activeComposite;
    private lastActiveCompositeId;
    private readonly instantiatedCompositeItems;
    protected titleLabel: ICompositeTitleLabel | undefined;
    private progressBar;
    private contentAreaSize;
    private readonly actionsListener;
    private currentCompositeOpenToken;
    private boundarySashes;
    private readonly trailingSeparator;
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, registry: CompositeRegistry<T>, activeCompositeSettingsKey: string, defaultCompositeId: string, nameForTelemetry: string, compositeCSSClass: string, titleForegroundColor: string | undefined, titleBorderColor: string | undefined, id: string, options: ICompositePartOptions);
    protected openComposite(id: string, focus?: boolean): Composite | undefined;
    private doOpenComposite;
    protected createComposite(id: string, isActive?: boolean): Composite;
    protected showComposite(composite: Composite): void;
    protected onTitleAreaUpdate(compositeId: string): void;
    private updateTitle;
    private collectCompositeActions;
    protected getActiveComposite(): IComposite | undefined;
    protected getLastActiveCompositeId(): string;
    protected hideActiveComposite(): Composite | undefined;
    protected createTitleArea(parent: HTMLElement): HTMLElement | undefined;
    protected createTitleLabel(parent: HTMLElement): ICompositeTitleLabel;
    protected createHeaderArea(): HTMLElement;
    protected createFooterArea(): HTMLElement;
    updateStyles(): void;
    protected actionViewItemProvider(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    protected actionsContextProvider(): unknown;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    protected getTitleAreaDropDownAnchorAlignment(): AnchorAlignment;
    layout(width: number, height: number, top: number, left: number): void;
    setBoundarySashes?(sashes: IBoundarySashes): void;
    protected removeComposite(compositeId: string): boolean;
    dispose(): void;
}
