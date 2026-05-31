
import { createTrustedTypesPolicy } from '../../../../../base/browser/trustedTypes.js';

const collapsedCellTTPolicy = createTrustedTypesPolicy('collapsedCellPreview', { createHTML: value => value });

export { collapsedCellTTPolicy };
