

const nullScopedAccessibilityProgressSignalFactory = () => ({
    msLoopTime: -1,
    msDelayTime: -1,
    dispose: () => { },
});
let progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;
function setProgressAccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
    progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}
function getProgressAccessibilitySignalScheduler(msDelayTime, msLoopTime) {
    return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}

export { getProgressAccessibilitySignalScheduler, setProgressAccessibilitySignalScheduler };
