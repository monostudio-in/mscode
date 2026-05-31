import { Event } from "../../../../base/common/event.js";
import { IObservable } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { ISCMRepository, ISCMProvider, type ISCMMenus, type ISCMRepositorySelectionMode, type ISCMRepositorySortKey, type ISCMViewVisibleRepositoryChangeEvent } from "./scm.js";
export declare const ISCMService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISCMService>;
export interface ISCMService {
    readonly _serviceBrand: undefined;
    readonly onDidAddRepository: Event<ISCMRepository>;
    readonly onDidRemoveRepository: Event<ISCMRepository>;
    readonly repositories: Iterable<ISCMRepository>;
    readonly repositoryCount: number;
    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
    getRepository(id: string): ISCMRepository | undefined;
    getRepository(resource: URI): ISCMRepository | undefined;
}
export declare const ISCMViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISCMViewService>;
export interface ISCMViewService {
    readonly _serviceBrand: undefined;
    readonly menus: ISCMMenus;
    readonly selectionModeConfig: IObservable<ISCMRepositorySelectionMode>;
    readonly explorerEnabledConfig: IObservable<boolean>;
    readonly graphShowIncomingChangesConfig: IObservable<boolean>;
    readonly graphShowOutgoingChangesConfig: IObservable<boolean>;
    repositories: ISCMRepository[];
    readonly onDidChangeRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    readonly didFinishLoadingRepositories: IObservable<boolean>;
    visibleRepositories: readonly ISCMRepository[];
    readonly onDidChangeVisibleRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    isVisible(repository: ISCMRepository): boolean;
    toggleVisibility(repository: ISCMRepository, visible?: boolean): void;
    toggleSortKey(sortKey: ISCMRepositorySortKey): void;
    toggleSelectionMode(selectionMode: ISCMRepositorySelectionMode): void;
    readonly focusedRepository: ISCMRepository | undefined;
    readonly onDidFocusRepository: Event<ISCMRepository | undefined>;
    focus(repository: ISCMRepository): void;
    /**
    * The active repository is the repository selected in the Source Control Repositories view
    * or the repository associated with the active editor. The active repository is shown in the
    * Source Control Repository status bar item.
    */
    readonly activeRepository: IObservable<{
        repository: ISCMRepository;
        pinned: boolean;
    } | undefined>;
    pinActiveRepository(repository: ISCMRepository | undefined): void;
}
