
import { QuickInputTreeRenderer } from './quickInputTreeRenderer.js';

class QuickInputTreeDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(_element) {
        return QuickInputTreeRenderer.ID;
    }
}

export { QuickInputTreeDelegate };
