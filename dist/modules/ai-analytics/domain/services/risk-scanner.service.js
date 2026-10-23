"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScannerService = void 0;
class RiskScannerService {
    riskRules = [
        {
            category: 'SAFETY',
            severity: 'CRITICAL',
            keywords: ['safety guard', 'hazard', 'injury', 'electrical fault', 'broken machine', 'press 4'],
        },
        {
            category: 'HARASSMENT',
            severity: 'CRITICAL',
            keywords: ['harassment', 'discrimination', 'abuse', 'hostile environment', 'bullying'],
        },
        {
            category: 'COMPLIANCE',
            severity: 'HIGH',
            keywords: ['fraud', 'bribe', 'breach', 'compliance violation', 'audit failure'],
        },
        {
            category: 'BURNOUT',
            severity: 'MEDIUM',
            keywords: ['overworked', 'exhausted', 'quitting', 'burnout', 'excessive hours'],
        },
    ];
    scan(text) {
        if (!text)
            return [];
        const lower = text.toLowerCase();
        const flags = [];
        for (const rule of this.riskRules) {
            for (const kw of rule.keywords) {
                if (lower.includes(kw)) {
                    flags.push({
                        category: rule.category,
                        severity: rule.severity,
                        keyword: kw,
                    });
                }
            }
        }
        return flags;
    }
}
exports.RiskScannerService = RiskScannerService;
//# sourceMappingURL=risk-scanner.service.js.map