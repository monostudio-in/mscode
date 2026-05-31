
import { mapValues } from '../../../../base/common/objects.js';
import { TestResultState } from './testTypes.js';

const statePriority = {
    [TestResultState.Running]: 6,
    [TestResultState.Errored]: 5,
    [TestResultState.Failed]: 4,
    [TestResultState.Queued]: 3,
    [TestResultState.Passed]: 2,
    [TestResultState.Unset]: 0,
    [TestResultState.Skipped]: 1
};
const isFailedState = s => s === TestResultState.Errored || s === TestResultState.Failed;
const isStateWithResult = s => s === TestResultState.Errored || s === TestResultState.Failed || s === TestResultState.Passed;
mapValues(statePriority, (priority, stateStr) => {
    const state = Number(stateStr);
    return {
        statusNode: true,
        state,
        priority
    };
});
const cmpPriority = (a, b) => statePriority[b] - statePriority[a];
const maxPriority = (...states) => {
    switch (states.length) {
    case 0:
        return TestResultState.Unset;
    case 1:
        return states[0];
    case 2:
        return statePriority[states[0]] > statePriority[states[1]] ? states[0] : states[1];
    default:
        {
            let max = states[0];
            for (let i = 1; i < states.length; i++) {
                if (statePriority[max] < statePriority[states[i]]) {
                    max = states[i];
                }
            }
            return max;
        }
    }
};
const statesInOrder = ( ( Object.keys(statePriority)).map(s => Number(s))).sort(cmpPriority);
const terminalStatePriorities = {
    [TestResultState.Passed]: 0,
    [TestResultState.Skipped]: 1,
    [TestResultState.Failed]: 2,
    [TestResultState.Errored]: 3
};
const makeEmptyCounts = () => {
    return ( new Uint32Array(statesInOrder.length));
};

export { cmpPriority, isFailedState, isStateWithResult, makeEmptyCounts, maxPriority, statePriority, statesInOrder, terminalStatePriorities };
