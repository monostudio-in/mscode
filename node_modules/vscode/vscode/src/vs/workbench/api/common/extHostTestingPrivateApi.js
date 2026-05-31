
import { InvalidTestItemError } from '../../contrib/testing/common/testItemCollection.js';

const eventPrivateApis = ( new WeakMap());
const createPrivateApiFor = (impl, controllerId) => {
    const api = {
        controllerId
    };
    eventPrivateApis.set(impl, api);
    return api;
};
const getPrivateApiFor = impl => {
    const api = eventPrivateApis.get(impl);
    if (!api) {
        throw ( new InvalidTestItemError(impl?.id || "<unknown>"));
    }
    return api;
};

export { createPrivateApiFor, getPrivateApiFor };
