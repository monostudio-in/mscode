
import '../../../base/common/platform.js';
import { env } from '../../../base/common/process.js';
import '../../../base/common/uuid.js';

function verifyMicrosoftInternalDomain(domainList) {
    const userDnsDomain = env["USERDNSDOMAIN"];
    if (!userDnsDomain) {
        return false;
    }
    const domain = userDnsDomain.toLowerCase();
    return ( domainList.some(msftDomain => domain === msftDomain));
}

export { verifyMicrosoftInternalDomain };
