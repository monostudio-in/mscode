

function unsupported() {
    throw new Error('unsupported');
}
const noop = () => { };
function memoized(fct) {
    let v = null;
    return (...args) => {
        if (v == null) {
            v = fct(...args);
        }
        return v;
    };
}
function memoizedConstructor(
ctor) {
    return new Proxy(ctor, {
        construct: memoized((target, args) => {
            return Reflect.construct(ctor, args);
        })
    });
}
async function sleep(duration) {
    await new Promise((resolve) => setTimeout(resolve, duration));
}
function throttle(fct, merge, delay) {
    let lastPromise = Promise.resolve();
    let toConsume = null;
    return async (param) => {
        if (toConsume == null) {
            toConsume = param;
            lastPromise = lastPromise
                .then(async () => await sleep(delay))
                .then(async () => {
                const _toConsume = toConsume;
                toConsume = null;
                await fct(_toConsume);
            });
        }
        else {
            toConsume = merge(toConsume, param);
        }
        await lastPromise;
    };
}

export { memoized, memoizedConstructor, noop, sleep, throttle, unsupported };
