
import { Event } from '../../../base/common/event.js';

class NullDataChannelService {
    get onDidSendData() {
        return Event.None;
    }
    getDataChannel(_channelId) {
        return {
            sendData: () => { },
        };
    }
}

export { NullDataChannelService };
