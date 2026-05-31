
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorExtensions } from '../../../common/editor.js';
import { FILE_EDITOR_INPUT_ID } from '../common/files.js';
import { FileEditorInput } from './editors/fileEditorInput.js';

( Registry.as(EditorExtensions.EditorFactory)).registerFileEditorFactory({
    typeId: FILE_EDITOR_INPUT_ID,
    createFileEditor: (
        resource,
        preferredResource,
        preferredName,
        preferredDescription,
        preferredEncoding,
        preferredLanguageId,
        preferredContents,
        instantiationService
    ) => {
        return instantiationService.createInstance(
            FileEditorInput,
            resource,
            preferredResource,
            preferredName,
            preferredDescription,
            preferredEncoding,
            preferredLanguageId,
            preferredContents
        );
    },
    isFileEditor: obj => {
        return obj instanceof FileEditorInput;
    }
});
