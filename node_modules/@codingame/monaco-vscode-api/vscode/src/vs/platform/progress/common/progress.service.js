
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IProgressService = ( createDecorator("progressService"));
const IEditorProgressService = ( createDecorator("editorProgressService"));

export { IEditorProgressService, IProgressService };
