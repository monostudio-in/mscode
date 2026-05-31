
import { Registry } from './vscode/src/vs/platform/registry/common/platform.js';
import { Extensions } from './vscode/src/vs/workbench/common/contributions.js';
import { LifecyclePhase } from './vscode/src/vs/workbench/services/lifecycle/common/lifecycle.js';
import { ILifecycleService } from './vscode/src/vs/workbench/services/lifecycle/common/lifecycle.service.js';
import { IInstantiationService } from './vscode/src/vs/platform/instantiation/common/instantiation.js';
import { Barrier, timeout, RunOnceScheduler, _runWhenIdle } from './vscode/src/vs/base/common/async.js';
import { Emitter } from './vscode/src/vs/base/common/event.js';
import { EditorExtensions } from './vscode/src/vs/workbench/common/editor.js';
import { StandaloneServices } from './vscode/src/vs/editor/standalone/browser/standaloneServices.js';
import { Disposable } from './vscode/src/vs/base/common/lifecycle.js';
import { IWorkbenchLayoutService } from './vscode/src/vs/workbench/services/layout/browser/layoutService.service.js';
import { setHoverDelegateFactory } from './vscode/src/vs/base/browser/ui/hover/hoverDelegateFactory.js';
import { setBaseLayerHoverDelegate } from './vscode/src/vs/base/browser/ui/hover/hoverDelegate2.js';
import { WorkbenchHoverDelegate } from './vscode/src/vs/platform/hover/browser/hover.js';
import { IHoverService } from './vscode/src/vs/platform/hover/browser/hover.service.js';
import { WorkbenchContextKeysHandler } from './vscode/src/vs/workbench/browser/contextkeys.js';

const layoutEmitter = new Emitter();
const onLayout = layoutEmitter.event;
const renderWorkbenchEmitter = new Emitter();
const onRenderWorkbench = renderWorkbenchEmitter.event;
const serviceInitializedBarrier = new Barrier();
const serviceInitializedEmitter = new Emitter();
const serviceInitializePreParticipants = [];
const serviceInitializeParticipants = [];
const serviceInitializePostParticipants = [];
function registerServiceInitializePreParticipant(participant) {
    serviceInitializePreParticipants.push(participant);
}
function registerServiceInitializeParticipant(participant) {
    serviceInitializeParticipants.push(participant);
}
function registerServiceInitializePostParticipant(participant) {
    serviceInitializePostParticipants.push(participant);
}
async function startup(instantiationService) {
    await instantiationService.invokeFunction(async (accessor) => {
        await Promise.all(serviceInitializePreParticipants.map((participant) => participant(accessor)));
    });
    await instantiationService.invokeFunction(async (accessor) => {
        setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, { instantHover: enableInstantHover }, {}));
        setBaseLayerHoverDelegate(accessor.get(IHoverService));
        const lifecycleService = accessor.get(ILifecycleService);
        Registry.as(Extensions.Workbench).start(accessor);
        Registry.as(EditorExtensions.EditorFactory).start(accessor);
        await Promise.all(serviceInitializeParticipants.map((participant) => participant(accessor)));
        lifecycleService.phase = LifecyclePhase.Ready;
    });
    await instantiationService.invokeFunction(async (accessor) => {
        await Promise.all(serviceInitializePostParticipants.map((participant) => participant(accessor)));
    });
    serviceInitializedBarrier.open();
    serviceInitializedEmitter.fire();
    void instantiationService.invokeFunction(async (accessor) => {
        const lifecycleService = accessor.get(ILifecycleService);
        onRenderWorkbench((accessor) => {
            accessor.get(IInstantiationService).createInstance(WorkbenchContextKeysHandler);
        });
        layoutEmitter.fire(accessor);
        renderWorkbenchEmitter.fire(accessor);
        await Promise.race([accessor.get(IWorkbenchLayoutService).whenRestored, timeout(2000)]);
        lifecycleService.phase = LifecyclePhase.Restored;
        const eventuallyPhaseScheduler = new RunOnceScheduler(() => {
            _runWhenIdle(window, () => {
                lifecycleService.phase = LifecyclePhase.Eventually;
            }, 2500);
        }, 2500);
        eventuallyPhaseScheduler.schedule();
    });
}
let servicesInitialized = false;
StandaloneServices.withServices(() => {
    servicesInitialized = true;
    return Disposable.None;
});
async function waitServicesReady() {
    await serviceInitializedBarrier.wait();
}
function checkServicesReady() {
    if (!serviceInitializedBarrier.isOpen()) {
        throw new Error('Services are not ready yet');
    }
}
function checkServicesNotInitialized() {
    if (servicesInitialized) {
        throw new Error('Services are already initialized');
    }
}

export { checkServicesNotInitialized, checkServicesReady, onLayout, onRenderWorkbench, registerServiceInitializeParticipant, registerServiceInitializePostParticipant, registerServiceInitializePreParticipant, serviceInitializedBarrier, serviceInitializedEmitter, servicesInitialized, startup, waitServicesReady };
