
import { addDisposableListener } from './dom.js';
import { Disposable } from '../common/lifecycle.js';
import { Mimes } from '../common/mime.js';

class DelayedDragHandler extends Disposable {
    constructor(container, callback) {
        super();
        this.timeout = undefined;
        this._register(addDisposableListener(container, 'dragover', e => {
            e.preventDefault();
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    callback();
                    this.timeout = undefined;
                }, 800);
            }
        }));
        ['dragleave', 'drop', 'dragend'].forEach(type => {
            this._register(addDisposableListener(container, type, () => {
                this.clearDragTimeout();
            }));
        });
    }
    clearDragTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    dispose() {
        super.dispose();
        this.clearDragTimeout();
    }
}
const DataTransfers = {
    RESOURCES: 'ResourceURLs',
    DOWNLOAD_URL: 'DownloadURL',
    FILES: 'Files',
    TEXT: Mimes.text,
    INTERNAL_URI_LIST: 'application/vnd.code.uri-list',
};

export { DataTransfers, DelayedDragHandler };
