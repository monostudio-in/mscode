
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { EditorModel } from './editorModel.js';
import { IFileService } from '../../../platform/files/common/files.service.js';
import { Mimes } from '../../../base/common/mime.js';

let BinaryEditorModel = class BinaryEditorModel extends EditorModel {
    constructor(resource, name, fileService) {
        super();
        this.resource = resource;
        this.name = name;
        this.fileService = fileService;
        this.mime = Mimes.binary;
    }
    getName() {
        return this.name;
    }
    getSize() {
        return this.size;
    }
    getMime() {
        return this.mime;
    }
    getETag() {
        return this.etag;
    }
    async resolve() {
        if (this.fileService.hasProvider(this.resource)) {
            const stat = await this.fileService.stat(this.resource);
            this.etag = stat.etag;
            if (typeof stat.size === "number") {
                this.size = stat.size;
            }
        }
        return super.resolve();
    }
};
BinaryEditorModel = ( __decorate([( __param(2, IFileService))], BinaryEditorModel));

export { BinaryEditorModel };
