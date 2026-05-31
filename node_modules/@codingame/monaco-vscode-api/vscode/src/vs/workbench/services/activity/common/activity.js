
import { Codicon } from '../../../../base/common/codicons.js';
import { activityWarningBadgeForeground, activityWarningBadgeBackground } from '../../../../platform/theme/common/colors/miscColors.js';

class BaseBadge {
    constructor(descriptorFn, stylesFn) {
        this.descriptorFn = descriptorFn;
        this.stylesFn = stylesFn;
    }
    getDescription() {
        return this.descriptorFn(null);
    }
    getColors(theme) {
        return this.stylesFn?.(theme);
    }
}
class NumberBadge extends BaseBadge {
    constructor(number, descriptorFn) {
        super(descriptorFn, undefined);
        this.number = number;
        this.number = number;
    }
    getDescription() {
        return this.descriptorFn(this.number);
    }
}
class IconBadge extends BaseBadge {
    constructor(icon, descriptorFn, stylesFn) {
        super(descriptorFn, stylesFn);
        this.icon = icon;
    }
}
class ProgressBadge extends BaseBadge {
    constructor(descriptorFn) {
        super(descriptorFn, undefined);
    }
}
class WarningBadge extends IconBadge {
    constructor(descriptorFn) {
        super(Codicon.warning, descriptorFn, (theme) => ({
            badgeBackground: theme.getColor(activityWarningBadgeBackground),
            badgeForeground: theme.getColor(activityWarningBadgeForeground),
            badgeBorder: undefined,
        }));
    }
}

export { IconBadge, NumberBadge, ProgressBadge, WarningBadge };
