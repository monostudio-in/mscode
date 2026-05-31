
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { LifecyclePhase } from '../services/lifecycle/common/lifecycle.js';
import { ILifecycleService } from '../services/lifecycle/common/lifecycle.service.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { DeferredPromise, runWhenGlobalIdle } from '../../base/common/async.js';
import { mark } from '../../base/common/performance.js';
import { ILogService } from '../../platform/log/common/log.service.js';
import { IEnvironmentService } from '../../platform/environment/common/environment.service.js';
import { getOrSet } from '../../base/common/map.js';
import { Disposable, DisposableStore, isDisposable } from '../../base/common/lifecycle.js';
import { IEditorPaneService } from '../services/editor/common/editorPaneService.service.js';

var Extensions;
(function(Extensions) {
    Extensions.Workbench = "workbench.contributions.kind";
})(Extensions || (Extensions = {}));
var WorkbenchPhase;
(function(WorkbenchPhase) {
    WorkbenchPhase[WorkbenchPhase["BlockStartup"] = 1] = "BlockStartup";
    WorkbenchPhase[WorkbenchPhase["BlockRestore"] = 2] = "BlockRestore";
    WorkbenchPhase[WorkbenchPhase["AfterRestored"] = 3] = "AfterRestored";
    WorkbenchPhase[WorkbenchPhase["Eventually"] = 4] = "Eventually";
})(WorkbenchPhase || (WorkbenchPhase = {}));
function isOnEditorWorkbenchContributionInstantiation(obj) {
    const candidate = obj;
    return !!candidate && typeof candidate.editorTypeId === "string";
}
function toWorkbenchPhase(phase) {
    switch (phase) {
    case LifecyclePhase.Restored:
        return WorkbenchPhase.AfterRestored;
    case LifecyclePhase.Eventually:
        return WorkbenchPhase.Eventually;
    }
}
function toLifecyclePhase(instantiation) {
    switch (instantiation) {
    case WorkbenchPhase.BlockStartup:
        return LifecyclePhase.Starting;
    case WorkbenchPhase.BlockRestore:
        return LifecyclePhase.Ready;
    case WorkbenchPhase.AfterRestored:
        return LifecyclePhase.Restored;
    case WorkbenchPhase.Eventually:
        return LifecyclePhase.Eventually;
    }
}
class WorkbenchContributionsRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this.contributionsByPhase = ( new Map());
        this.contributionsByEditor = ( new Map());
        this.contributionsById = ( new Map());
        this.instancesById = ( new Map());
        this.instanceDisposables = this._register(( new DisposableStore()));
        this.timingsByPhase = ( new Map());
        this.pendingRestoredContributions = ( new DeferredPromise());
        this.whenRestored = this.pendingRestoredContributions.p;
    }
    static {
        this.INSTANCE = ( new WorkbenchContributionsRegistry());
    }
    static {
        this.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD = 20;
    }
    static {
        this.BLOCK_AFTER_RESTORE_WARN_THRESHOLD = 100;
    }
    get timings() {
        return this.timingsByPhase;
    }
    registerWorkbenchContribution2(id, ctor, instantiation) {
        const contribution = {
            id,
            ctor
        };
        if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.editorPaneService && ((typeof instantiation === "number" && this.lifecycleService.phase >= instantiation) || (typeof id === "string" && isOnEditorWorkbenchContributionInstantiation(instantiation) && this.editorPaneService.didInstantiateEditorPane(instantiation.editorTypeId)))) {
            this.safeCreateContribution(
                this.instantiationService,
                this.logService,
                this.environmentService,
                contribution,
                typeof instantiation === "number" ? toLifecyclePhase(instantiation) : this.lifecycleService.phase
            );
        }
        else {
            if (typeof instantiation === "number") {
                getOrSet(this.contributionsByPhase, toLifecyclePhase(instantiation), []).push(contribution);
            }
            if (typeof id === "string") {
                if (!( this.contributionsById.has(id))) {
                    this.contributionsById.set(id, contribution);
                } else {
                    console.error(
                        `IWorkbenchContributionsRegistry#registerWorkbenchContribution(): Can't register multiple contributions with same id '${id}'`
                    );
                }
                if (isOnEditorWorkbenchContributionInstantiation(instantiation)) {
                    getOrSet(this.contributionsByEditor, instantiation.editorTypeId, []).push(contribution);
                }
            }
        }
    }
    registerWorkbenchContribution(ctor, phase) {
        this.registerWorkbenchContribution2(undefined, ctor, toWorkbenchPhase(phase));
    }
    getWorkbenchContribution(id) {
        if (( this.instancesById.has(id))) {
            return this.instancesById.get(id);
        }
        const instantiationService = this.instantiationService;
        const lifecycleService = this.lifecycleService;
        const logService = this.logService;
        const environmentService = this.environmentService;
        if (!instantiationService || !lifecycleService || !logService || !environmentService) {
            throw ( new Error(
                `IWorkbenchContributionsRegistry#getContribution('${id}'): cannot be called before registry started`
            ));
        }
        const contribution = this.contributionsById.get(id);
        if (!contribution) {
            throw ( new Error(
                `IWorkbenchContributionsRegistry#getContribution('${id}'): contribution with that identifier is unknown.`
            ));
        }
        if (lifecycleService.phase < LifecyclePhase.Restored) {
            logService.warn(
                `IWorkbenchContributionsRegistry#getContribution('${id}'): contribution instantiated before LifecyclePhase.Restored!`
            );
        }
        this.safeCreateContribution(
            instantiationService,
            logService,
            environmentService,
            contribution,
            lifecycleService.phase
        );
        const instance = this.instancesById.get(id);
        if (!instance) {
            throw ( new Error(
                `IWorkbenchContributionsRegistry#getContribution('${id}'): failed to create contribution.`
            ));
        }
        return instance;
    }
    start(accessor) {
        const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
        const lifecycleService = this.lifecycleService = accessor.get(ILifecycleService);
        const logService = this.logService = accessor.get(ILogService);
        const environmentService = this.environmentService = accessor.get(IEnvironmentService);
        const editorPaneService = this.editorPaneService = accessor.get(IEditorPaneService);
        this._register(lifecycleService.onDidShutdown(() => {
            this.instanceDisposables.clear();
        }));
        for (const phase of [
            LifecyclePhase.Starting,
            LifecyclePhase.Ready,
            LifecyclePhase.Restored,
            LifecyclePhase.Eventually
        ]) {
            this.instantiateByPhase(
                instantiationService,
                lifecycleService,
                logService,
                environmentService,
                phase
            );
        }
        for (const editorTypeId of ( this.contributionsByEditor.keys())) {
            if (editorPaneService.didInstantiateEditorPane(editorTypeId)) {
                this.onEditor(
                    editorTypeId,
                    instantiationService,
                    lifecycleService,
                    logService,
                    environmentService
                );
            }
        }
        this._register(editorPaneService.onWillInstantiateEditorPane(e => this.onEditor(
            e.typeId,
            instantiationService,
            lifecycleService,
            logService,
            environmentService
        )));
    }
    onEditor(
        editorTypeId,
        instantiationService,
        lifecycleService,
        logService,
        environmentService
    ) {
        const contributions = this.contributionsByEditor.get(editorTypeId);
        if (contributions) {
            this.contributionsByEditor.delete(editorTypeId);
            for (const contribution of contributions) {
                this.safeCreateContribution(
                    instantiationService,
                    logService,
                    environmentService,
                    contribution,
                    lifecycleService.phase
                );
            }
        }
    }
    instantiateByPhase(
        instantiationService,
        lifecycleService,
        logService,
        environmentService,
        phase
    ) {
        if (lifecycleService.phase >= phase) {
            this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
        }
        else {
            lifecycleService.when(phase).then(
                () => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase)
            );
        }
    }
    async doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
        const contributions = this.contributionsByPhase.get(phase);
        if (contributions) {
            this.contributionsByPhase.delete(phase);
            switch (phase) {
            case LifecyclePhase.Starting:
            case LifecyclePhase.Ready:
                {
                    mark(`code/willCreateWorkbenchContributions/${phase}`);
                    for (const contribution of contributions) {
                        this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                    }
                    mark(`code/didCreateWorkbenchContributions/${phase}`);
                    break;
                }
            case LifecyclePhase.Restored:
            case LifecyclePhase.Eventually:
                {
                    if (phase === LifecyclePhase.Eventually) {
                        await this.pendingRestoredContributions.p;
                    }
                    this.doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase);
                    break;
                }
            }
        }
    }
    doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase) {
        mark(`code/willCreateWorkbenchContributions/${phase}`);
        let i = 0;
        const forcedTimeout = phase === LifecyclePhase.Eventually ? 3000 : 500;
        const instantiateSome = idle => {
            while (i < contributions.length) {
                const contribution = contributions[i++];
                this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                if (idle.timeRemaining() < 1) {
                    runWhenGlobalIdle(instantiateSome, forcedTimeout);
                    break;
                }
            }
            if (i === contributions.length) {
                mark(`code/didCreateWorkbenchContributions/${phase}`);
                if (phase === LifecyclePhase.Restored) {
                    this.pendingRestoredContributions.complete();
                }
            }
        };
        runWhenGlobalIdle(instantiateSome, forcedTimeout);
    }
    safeCreateContribution(instantiationService, logService, environmentService, contribution, phase) {
        if (typeof contribution.id === "string" && ( this.instancesById.has(contribution.id))) {
            return;
        }
        const now = Date.now();
        try {
            if (typeof contribution.id === "string") {
                mark(`code/willCreateWorkbenchContribution/${phase}/${contribution.id}`);
            }
            const instance = instantiationService.createInstance(contribution.ctor);
            if (typeof contribution.id === "string") {
                this.instancesById.set(contribution.id, instance);
                this.contributionsById.delete(contribution.id);
            }
            if (isDisposable(instance)) {
                this.instanceDisposables.add(instance);
            }
        } catch (error) {
            logService.error(
                `Unable to create workbench contribution '${contribution.id ?? contribution.ctor.name}'.`,
                error
            );
        } finally {
            if (typeof contribution.id === "string") {
                mark(`code/didCreateWorkbenchContribution/${phase}/${contribution.id}`);
            }
        }
        if (typeof contribution.id === "string" || !environmentService.isBuilt ) {
            const time = Date.now() - now;
            if (time > (phase < LifecyclePhase.Restored ? WorkbenchContributionsRegistry.BLOCK_BEFORE_RESTORE_WARN_THRESHOLD : WorkbenchContributionsRegistry.BLOCK_AFTER_RESTORE_WARN_THRESHOLD)) {
                logService.warn(
                    `Creation of workbench contribution '${contribution.id ?? contribution.ctor.name}' took ${time}ms.`
                );
            }
            if (typeof contribution.id === "string") {
                let timingsForPhase = this.timingsByPhase.get(phase);
                if (!timingsForPhase) {
                    timingsForPhase = [];
                    this.timingsByPhase.set(phase, timingsForPhase);
                }
                timingsForPhase.push([contribution.id, time]);
            }
        }
    }
}
const registerWorkbenchContribution2 = WorkbenchContributionsRegistry.INSTANCE.registerWorkbenchContribution2.bind(WorkbenchContributionsRegistry.INSTANCE);
const getWorkbenchContribution = WorkbenchContributionsRegistry.INSTANCE.getWorkbenchContribution.bind(WorkbenchContributionsRegistry.INSTANCE);
Registry.add(Extensions.Workbench, WorkbenchContributionsRegistry.INSTANCE);

export { Extensions, WorkbenchContributionsRegistry, WorkbenchPhase, getWorkbenchContribution, registerWorkbenchContribution2 };
