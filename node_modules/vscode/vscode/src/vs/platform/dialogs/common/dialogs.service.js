
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IDialogService = ( createDecorator("dialogService"));
const IFileDialogService = ( createDecorator("fileDialogService"));

export { IDialogService, IFileDialogService };
