
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';

const IExtHostDataChannels = ( createDecorator("IExtHostDataChannels"));
class ExtHostDataChannels {
    constructor() {
        this._channels = ( new Map());
    }
    createDataChannel(extension, channelId) {
        checkProposedApiEnabled(extension, "dataChannels");
        let channel = this._channels.get(channelId);
        if (!channel) {
            channel = ( new DataChannelImpl(channelId));
            this._channels.set(channelId, channel);
        }
        return channel;
    }
    $onDidReceiveData(channelId, data) {
        const channel = this._channels.get(channelId);
        if (channel) {
            channel._fireDidReceiveData(data);
        }
    }
}
class DataChannelImpl extends Disposable {
    constructor(channelId) {
        super();
        this.channelId = channelId;
        this._onDidReceiveData = ( new Emitter());
        this.onDidReceiveData = this._onDidReceiveData.event;
        this._register(this._onDidReceiveData);
    }
    _fireDidReceiveData(data) {
        this._onDidReceiveData.fire({
            data
        });
    }
    toString() {
        return `DataChannel(${this.channelId})`;
    }
}

export { ExtHostDataChannels, IExtHostDataChannels };
