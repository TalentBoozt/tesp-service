"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyGuardService = void 0;
class PrivacyGuardService {
    static MIN_THRESHOLD = 5;
    applyPrivacyGuard(responseCount, computedEnps, computedEngagementIndex) {
        if (responseCount < PrivacyGuardService.MIN_THRESHOLD) {
            return {
                status: 'SUPPRESSED',
                responseCount,
                eNPS: null,
                engagementIndex: null,
                reason: `Sample size N (${responseCount}) is below anonymity threshold N < ${PrivacyGuardService.MIN_THRESHOLD}`,
            };
        }
        return {
            status: 'VALID',
            responseCount,
            eNPS: computedEnps,
            engagementIndex: computedEngagementIndex,
        };
    }
}
exports.PrivacyGuardService = PrivacyGuardService;
//# sourceMappingURL=privacy-guard.service.js.map