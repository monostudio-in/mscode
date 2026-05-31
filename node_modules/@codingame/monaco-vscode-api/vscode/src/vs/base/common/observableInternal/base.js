
import { onUnexpectedError } from '../errors.js';
import '../equals.js';
import '../event.js';
import '../lifecycle.js';

function handleBugIndicatingErrorRecovery(message) {
    const err = ( new Error("BugIndicatingErrorRecovery: " + message));
    onUnexpectedError(err);
    console.error("recovered from an error that indicates a bug", err);
}

export { handleBugIndicatingErrorRecovery };
