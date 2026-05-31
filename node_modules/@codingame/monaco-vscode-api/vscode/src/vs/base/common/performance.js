

function _definePolyfillMarks(timeOrigin) {
    const _data = [];
    if (typeof timeOrigin === 'number') {
        _data.push('code/timeOrigin', timeOrigin);
    }
    function mark(name, markOptions) {
        _data.push(name, markOptions?.startTime ?? Date.now());
    }
    function getMarks() {
        const result = [];
        for (let i = 0; i < _data.length; i += 2) {
            result.push({
                name: _data[i],
                startTime: _data[i + 1],
            });
        }
        return result;
    }
    function clearMarks(name) {
        if (typeof name === 'undefined') {
            const hasTimeOrigin = _data.length >= 2 && _data[0] === 'code/timeOrigin';
            const timeOriginValue = hasTimeOrigin ? _data[1] : undefined;
            _data.length = 0;
            if (hasTimeOrigin) {
                _data.push('code/timeOrigin', timeOriginValue);
            }
        }
        else {
            for (let i = _data.length - 2; i >= 0; i -= 2) {
                if (_data[i] === name) {
                    _data.splice(i, 2);
                }
            }
        }
    }
    return { mark, getMarks, clearMarks };
}
function _define() {
    if (typeof performance === 'object' && typeof performance.mark === 'function' && !performance.nodeTiming) {
        if (typeof performance.timeOrigin !== 'number' && !performance.timing) {
            return _definePolyfillMarks();
        }
        else {
            return {
                mark(name, markOptions) {
                    performance.mark(name, markOptions);
                },
                clearMarks(name) {
                    performance.clearMarks(name);
                },
                getMarks() {
                    let timeOrigin = performance.timeOrigin;
                    if (typeof timeOrigin !== 'number') {
                        timeOrigin = (performance.timing.navigationStart || performance.timing.redirectStart || performance.timing.fetchStart) ?? 0;
                    }
                    const result = [{ name: 'code/timeOrigin', startTime: Math.round(timeOrigin) }];
                    for (const entry of performance.getEntriesByType('mark')) {
                        result.push({
                            name: entry.name,
                            startTime: Math.round(timeOrigin + entry.startTime)
                        });
                    }
                    return result;
                }
            };
        }
    }
    else if (typeof process === 'object') {
        const timeOrigin = performance?.timeOrigin;
        return _definePolyfillMarks(timeOrigin);
    }
    else {
        console.trace('perf-util loaded in UNKNOWN environment');
        return _definePolyfillMarks();
    }
}
function _factory(sharedObj) {
    if (!sharedObj.MonacoPerformanceMarks) {
        sharedObj.MonacoPerformanceMarks = _define();
    }
    return sharedObj.MonacoPerformanceMarks;
}
const perf = _factory(globalThis);
const mark = perf.mark;
const clearMarks = perf.clearMarks;
const getMarks = perf.getMarks;

export { clearMarks, getMarks, mark };
