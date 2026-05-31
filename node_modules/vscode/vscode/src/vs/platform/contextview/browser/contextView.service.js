
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IContextViewService = ( createDecorator("contextViewService"));
const IContextMenuService = ( createDecorator("contextMenuService"));

export { IContextMenuService, IContextViewService };
