
import '../common/observableInternal/index.js';
import { observableValue } from '../common/observableInternal/observables/observableValue.js';

var inputLatency;
(function (inputLatency) {
    const totalKeydownTime = { total: 0, min: Number.MAX_VALUE, max: 0 };
    const totalInputTime = { ...totalKeydownTime };
    const totalRenderTime = { ...totalKeydownTime };
    const totalInputLatencyTime = { ...totalKeydownTime };
    let measurementsCount = 0;
    inputLatency.sampleCount = observableValue('inputLatency.sampleCount', 0);
    let EventPhase;
    (function (EventPhase) {
        EventPhase[EventPhase["Before"] = 0] = "Before";
        EventPhase[EventPhase["InProgress"] = 1] = "InProgress";
        EventPhase[EventPhase["Finished"] = 2] = "Finished";
    })(EventPhase || (EventPhase = {}));
    const state = {
        keydown: EventPhase.Before,
        input: EventPhase.Before,
        render: EventPhase.Before,
    };
    function onKeyDown() {
        recordIfFinished();
        performance.mark('inputlatency/start');
        performance.mark('keydown/start');
        state.keydown = EventPhase.InProgress;
        queueMicrotask(markKeyDownEnd);
    }
    inputLatency.onKeyDown = onKeyDown;
    function markKeyDownEnd() {
        if (state.keydown === EventPhase.InProgress) {
            performance.mark('keydown/end');
            state.keydown = EventPhase.Finished;
        }
    }
    function onBeforeInput() {
        performance.mark('input/start');
        state.input = EventPhase.InProgress;
        scheduleRecordIfFinishedTask();
    }
    inputLatency.onBeforeInput = onBeforeInput;
    function onInput() {
        if (state.input === EventPhase.Before) {
            onBeforeInput();
        }
        queueMicrotask(markInputEnd);
    }
    inputLatency.onInput = onInput;
    function markInputEnd() {
        if (state.input === EventPhase.InProgress) {
            performance.mark('input/end');
            state.input = EventPhase.Finished;
        }
    }
    function onKeyUp() {
        recordIfFinished();
    }
    inputLatency.onKeyUp = onKeyUp;
    function onSelectionChange() {
        recordIfFinished();
    }
    inputLatency.onSelectionChange = onSelectionChange;
    function onRenderStart() {
        if (state.keydown === EventPhase.Finished && state.input === EventPhase.Finished && state.render === EventPhase.Before) {
            performance.mark('render/start');
            state.render = EventPhase.InProgress;
            queueMicrotask(markRenderEnd);
            scheduleRecordIfFinishedTask();
        }
    }
    inputLatency.onRenderStart = onRenderStart;
    function markRenderEnd() {
        if (state.render === EventPhase.InProgress) {
            performance.mark('render/end');
            state.render = EventPhase.Finished;
        }
    }
    function scheduleRecordIfFinishedTask() {
        setTimeout(recordIfFinished);
    }
    function recordIfFinished() {
        if (state.keydown === EventPhase.Finished && state.input === EventPhase.Finished && state.render === EventPhase.Finished) {
            performance.mark('inputlatency/end');
            performance.measure('keydown', 'keydown/start', 'keydown/end');
            performance.measure('input', 'input/start', 'input/end');
            performance.measure('render', 'render/start', 'render/end');
            performance.measure('inputlatency', 'inputlatency/start', 'inputlatency/end');
            addMeasure('keydown', totalKeydownTime);
            addMeasure('input', totalInputTime);
            addMeasure('render', totalRenderTime);
            addMeasure('inputlatency', totalInputLatencyTime);
            measurementsCount++;
            inputLatency.sampleCount.set(inputLatency.sampleCount.get() + 1, undefined);
            reset();
        }
    }
    function addMeasure(entryName, cumulativeMeasurement) {
        const duration = performance.getEntriesByName(entryName)[0].duration;
        cumulativeMeasurement.total += duration;
        cumulativeMeasurement.min = Math.min(cumulativeMeasurement.min, duration);
        cumulativeMeasurement.max = Math.max(cumulativeMeasurement.max, duration);
    }
    function reset() {
        performance.clearMarks('keydown/start');
        performance.clearMarks('keydown/end');
        performance.clearMarks('input/start');
        performance.clearMarks('input/end');
        performance.clearMarks('render/start');
        performance.clearMarks('render/end');
        performance.clearMarks('inputlatency/start');
        performance.clearMarks('inputlatency/end');
        performance.clearMeasures('keydown');
        performance.clearMeasures('input');
        performance.clearMeasures('render');
        performance.clearMeasures('inputlatency');
        state.keydown = EventPhase.Before;
        state.input = EventPhase.Before;
        state.render = EventPhase.Before;
    }
    function getAndClearMeasurements() {
        if (measurementsCount === 0) {
            return undefined;
        }
        const result = {
            keydown: cumulativeToFinalMeasurement(totalKeydownTime),
            input: cumulativeToFinalMeasurement(totalInputTime),
            render: cumulativeToFinalMeasurement(totalRenderTime),
            total: cumulativeToFinalMeasurement(totalInputLatencyTime),
            sampleCount: measurementsCount
        };
        clearCumulativeMeasurement(totalKeydownTime);
        clearCumulativeMeasurement(totalInputTime);
        clearCumulativeMeasurement(totalRenderTime);
        clearCumulativeMeasurement(totalInputLatencyTime);
        measurementsCount = 0;
        return result;
    }
    inputLatency.getAndClearMeasurements = getAndClearMeasurements;
    function cumulativeToFinalMeasurement(cumulative) {
        return {
            average: cumulative.total / measurementsCount,
            max: cumulative.max,
            min: cumulative.min,
        };
    }
    function clearCumulativeMeasurement(cumulative) {
        cumulative.total = 0;
        cumulative.min = Number.MAX_VALUE;
        cumulative.max = 0;
    }
})(inputLatency || (inputLatency = {}));

export { inputLatency };
