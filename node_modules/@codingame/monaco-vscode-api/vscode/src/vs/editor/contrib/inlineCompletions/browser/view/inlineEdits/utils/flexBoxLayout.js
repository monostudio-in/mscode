

function distributeFlexBoxLayout(totalSize, parts) {
    const normalizedParts = {};
    for (const [key, part] of Object.entries(parts)) {
        if (Array.isArray(part)) {
            normalizedParts[key] = {
                min: 0,
                rules: part
            };
        } else {
            normalizedParts[key] = {
                min: part.min ?? 0,
                rules: part.rules ?? [{
                    max: part.max,
                    priority: part.priority,
                    share: part.share
                }]
            };
        }
    }
    const result = {};
    let usedSize = 0;
    for (const [key, part] of Object.entries(normalizedParts)) {
        result[key] = part.min;
        usedSize += part.min;
    }
    if (usedSize > totalSize) {
        return null;
    }
    let remainingSize = totalSize - usedSize;
    while (remainingSize > 0) {
        const candidateRules = [];
        for (const [key, part] of Object.entries(normalizedParts)) {
            for (let i = 0; i < part.rules.length; i++) {
                const rule = part.rules[i];
                const currentUsage = result[key];
                const maxSize = rule.max ?? Infinity;
                if (currentUsage < maxSize) {
                    candidateRules.push({
                        partKey: key,
                        ruleIndex: i,
                        rule,
                        priority: rule.priority ?? 0,
                        share: rule.share ?? 1
                    });
                }
            }
        }
        if (candidateRules.length === 0) {
            break;
        }
        const maxPriority = Math.max(...( candidateRules.map(c => c.priority)));
        const highestPriorityCandidates = candidateRules.filter(c => c.priority === maxPriority);
        const totalShare = highestPriorityCandidates.reduce((sum, c) => sum + c.share, 0);
        let distributedThisRound = 0;
        const distributions = [];
        for (const candidate of highestPriorityCandidates) {
            const rule = candidate.rule;
            const currentUsage = result[candidate.partKey];
            const maxSize = rule.max ?? Infinity;
            const availableForThisRule = maxSize - currentUsage;
            const idealShare = (remainingSize * candidate.share) / totalShare;
            const actualAmount = Math.min(idealShare, availableForThisRule);
            distributions.push({
                partKey: candidate.partKey,
                ruleIndex: candidate.ruleIndex,
                amount: actualAmount
            });
            distributedThisRound += actualAmount;
        }
        if (distributedThisRound === 0) {
            break;
        }
        for (const dist of distributions) {
            result[dist.partKey] += dist.amount;
        }
        remainingSize -= distributedThisRound;
        if (remainingSize < 0.0001) {
            break;
        }
    }
    return result;
}

export { distributeFlexBoxLayout };
