
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const INotebookKernelService = ( createDecorator("INotebookKernelService"));
const INotebookKernelHistoryService = ( createDecorator("INotebookKernelHistoryService"));

export { INotebookKernelHistoryService, INotebookKernelService };
