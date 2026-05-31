
import { localize } from '../../nls.js';
import { Lazy } from './lazy.js';
import { LANGUAGE_DEFAULT } from './platform.js';

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;
function fromNow(date, appendAgoLabel, useFullTimeWords, disallowNow) {
    if (typeof date === "undefined") {
        return localize(48, "unknown");
    }
    if (typeof date !== "number") {
        date = date.getTime();
    }
    const seconds = Math.round((( new Date()).getTime() - date) / 1000);
    if (seconds < -30) {
        return localize(49, "in {0}", fromNow(( new Date()).getTime() + seconds * 1000, false));
    }
    if (!disallowNow && seconds < 30) {
        return localize(50, "now");
    }
    let value;
    if (seconds < minute) {
        value = seconds;
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords ? ( localize(51, "{0} second ago", value)) : ( localize(52, "{0} sec ago", value));
            } else {
                return useFullTimeWords ? ( localize(53, "{0} seconds ago", value)) : ( localize(54, "{0} secs ago", value));
            }
        } else {
            if (value === 1) {
                return useFullTimeWords ? ( localize(55, "{0} second", value)) : ( localize(56, "{0} sec", value));
            } else {
                return useFullTimeWords ? ( localize(57, "{0} seconds", value)) : ( localize(58, "{0} secs", value));
            }
        }
    }
    if (seconds < hour) {
        value = Math.round(seconds / minute);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords ? ( localize(59, "{0} minute ago", value)) : ( localize(60, "{0} min ago", value));
            } else {
                return useFullTimeWords ? ( localize(61, "{0} minutes ago", value)) : ( localize(62, "{0} mins ago", value));
            }
        } else {
            if (value === 1) {
                return useFullTimeWords ? ( localize(63, "{0} minute", value)) : ( localize(64, "{0} min", value));
            } else {
                return useFullTimeWords ? ( localize(65, "{0} minutes", value)) : ( localize(66, "{0} mins", value));
            }
        }
    }
    if (seconds < day) {
        value = Math.round(seconds / hour);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords ? ( localize(67, "{0} hour ago", value)) : ( localize(68, "{0} hr ago", value));
            } else {
                return useFullTimeWords ? ( localize(69, "{0} hours ago", value)) : ( localize(70, "{0} hrs ago", value));
            }
        } else {
            if (value === 1) {
                return useFullTimeWords ? ( localize(71, "{0} hour", value)) : ( localize(72, "{0} hr", value));
            } else {
                return useFullTimeWords ? ( localize(73, "{0} hours", value)) : ( localize(74, "{0} hrs", value));
            }
        }
    }
    if (seconds < week) {
        value = Math.round(seconds / day);
        if (appendAgoLabel) {
            return value === 1 ? ( localize(75, "{0} day ago", value)) : ( localize(76, "{0} days ago", value));
        } else {
            return value === 1 ? ( localize(77, "{0} day", value)) : ( localize(78, "{0} days", value));
        }
    }
    if (seconds < month) {
        value = Math.round(seconds / week);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords ? ( localize(79, "{0} week ago", value)) : ( localize(80, "{0} wk ago", value));
            } else {
                return useFullTimeWords ? ( localize(81, "{0} weeks ago", value)) : ( localize(82, "{0} wks ago", value));
            }
        } else {
            if (value === 1) {
                return useFullTimeWords ? ( localize(83, "{0} week", value)) : ( localize(84, "{0} wk", value));
            } else {
                return useFullTimeWords ? ( localize(85, "{0} weeks", value)) : ( localize(86, "{0} wks", value));
            }
        }
    }
    if (seconds < year) {
        value = Math.round(seconds / month);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords ? ( localize(87, "{0} month ago", value)) : ( localize(88, "{0} mo ago", value));
            } else {
                return useFullTimeWords ? ( localize(89, "{0} months ago", value)) : ( localize(90, "{0} mos ago", value));
            }
        } else {
            if (value === 1) {
                return useFullTimeWords ? ( localize(91, "{0} month", value)) : ( localize(92, "{0} mo", value));
            } else {
                return useFullTimeWords ? ( localize(93, "{0} months", value)) : ( localize(94, "{0} mos", value));
            }
        }
    }
    value = Math.round(seconds / year);
    if (appendAgoLabel) {
        if (value === 1) {
            return useFullTimeWords ? ( localize(95, "{0} year ago", value)) : ( localize(96, "{0} yr ago", value));
        } else {
            return useFullTimeWords ? ( localize(97, "{0} years ago", value)) : ( localize(98, "{0} yrs ago", value));
        }
    } else {
        if (value === 1) {
            return useFullTimeWords ? ( localize(99, "{0} year", value)) : ( localize(100, "{0} yr", value));
        } else {
            return useFullTimeWords ? ( localize(101, "{0} years", value)) : ( localize(102, "{0} yrs", value));
        }
    }
}
function getDurationString(ms, useFullTimeWords) {
    const seconds = Math.abs(ms / 1000);
    if (seconds < 1) {
        return useFullTimeWords ? ( localize(103, "{0} milliseconds", ms)) : ( localize(104, "{0}ms", ms));
    }
    if (seconds < minute) {
        return useFullTimeWords ? ( localize(105, "{0} seconds", Math.round(ms) / 1000)) : ( localize(106, "{0}s", Math.round(ms) / 1000));
    }
    if (seconds < hour) {
        return useFullTimeWords ? ( localize(107, "{0} minutes", Math.round(ms / (1000 * minute)))) : ( localize(108, "{0} mins", Math.round(ms / (1000 * minute))));
    }
    if (seconds < day) {
        return useFullTimeWords ? ( localize(109, "{0} hours", Math.round(ms / (1000 * hour)))) : ( localize(110, "{0} hrs", Math.round(ms / (1000 * hour))));
    }
    return localize(111, "{0} days", Math.round(ms / (1000 * day)));
}
function toLocalISOString(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
}
const safeIntl = {
    DateTimeFormat(locales, options) {
        return ( new Lazy(() => {
            try {
                return new Intl.DateTimeFormat(locales, options);
            } catch {
                return new Intl.DateTimeFormat(undefined, options);
            }
        }));
    },
    Collator(locales, options) {
        return ( new Lazy(() => {
            try {
                return new Intl.Collator(locales, options);
            } catch {
                return new Intl.Collator(undefined, options);
            }
        }));
    },
    Segmenter(locales, options) {
        return ( new Lazy(() => {
            try {
                return new Intl.Segmenter(locales, options);
            } catch {
                return new Intl.Segmenter(undefined, options);
            }
        }));
    },
    Locale(tag, options) {
        return ( new Lazy(() => {
            try {
                return new Intl.Locale(tag, options);
            } catch {
                return new Intl.Locale(LANGUAGE_DEFAULT, options);
            }
        }));
    },
    NumberFormat(locales, options) {
        return ( new Lazy(() => {
            try {
                return new Intl.NumberFormat(locales, options);
            } catch {
                return new Intl.NumberFormat(undefined, options);
            }
        }));
    }
};

export { fromNow, getDurationString, safeIntl, toLocalISOString };
