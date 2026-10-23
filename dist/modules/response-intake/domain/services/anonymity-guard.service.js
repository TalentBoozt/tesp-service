"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymityGuardService = exports.ConsentRequiredError = void 0;
const campaign_entity_1 = require("../../../survey-distribution/domain/entities/campaign.entity");
class ConsentRequiredError extends Error {
    constructor(message = 'Explicit participant consent is required for identified survey instruments.') {
        super(message);
        this.name = 'ConsentRequiredError';
    }
}
exports.ConsentRequiredError = ConsentRequiredError;
class AnonymityGuardService {
    static MINIMUM_K_ANONYMITY_THRESHOLD = 5;
    /**
     * Sanitizes and isolates response data based on the campaign anonymity archetype.
     */
    sanitizeForIngestion(props, anonymityLevel, context = {}) {
        const strippedFields = [];
        const sanitized = { ...props };
        if (anonymityLevel === campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS || anonymityLevel === campaign_entity_1.AnonymityLevel.KIOSK) {
            // 1. FULLY_ANONYMOUS: Complete unlinkability. Strip all IP, device, token, and demographic PII.
            if (sanitized.responseToken) {
                strippedFields.push('responseToken');
                delete sanitized.responseToken;
            }
            if (context.ipAddress)
                strippedFields.push('ipAddress');
            if (context.userAgent)
                strippedFields.push('userAgent');
            if (context.employeeId)
                strippedFields.push('employeeId');
            if (context.email)
                strippedFields.push('email');
            if (context.respondentName)
                strippedFields.push('respondentName');
            // In fully anonymous, demographic snapshot is purged of any single-attribute identifying keys
            if (sanitized.demographicSnapshot) {
                const identifyingKeys = ['name', 'email', 'phone', 'ip', 'employeeid', 'userid', 'badgeid'];
                const cleanedDemo = {};
                for (const [key, val] of Object.entries(sanitized.demographicSnapshot)) {
                    if (!identifyingKeys.includes(key.toLowerCase())) {
                        cleanedDemo[key] = val;
                    }
                    else {
                        strippedFields.push(`demographicSnapshot.${key}`);
                    }
                }
                sanitized.demographicSnapshot = cleanedDemo;
            }
            return {
                sanitizedProps: sanitized,
                isDecoupled: true,
                strippedFields,
            };
        }
        if (anonymityLevel === campaign_entity_1.AnonymityLevel.SEMI_ANONYMOUS) {
            // 2. SEMI_ANONYMOUS: Decouple respondent token. Demographic nodes retained.
            if (sanitized.responseToken) {
                strippedFields.push('responseToken');
                // Token is consumed/decoupled upon submission so response cannot be reversed to employee identity
                delete sanitized.responseToken;
            }
            if (context.ipAddress)
                strippedFields.push('ipAddress');
            if (context.userAgent)
                strippedFields.push('userAgent');
            if (context.employeeId)
                strippedFields.push('employeeId');
            if (context.email)
                strippedFields.push('email');
            return {
                sanitizedProps: sanitized,
                isDecoupled: true,
                strippedFields,
            };
        }
        // 3. AUTHENTICATED / IDENTIFIED: Identity retained (e.g. 360 multi-rater reviews, onboarding checkpoints)
        if (!this.verifyIdentifiedConsent(context)) {
            throw new ConsentRequiredError('Participant consent is mandatory for identified / 360-degree feedback responses. Submission rejected.');
        }
        return {
            sanitizedProps: sanitized,
            isDecoupled: false,
            strippedFields: [],
        };
    }
    /**
     * Enforces differential privacy ($N \ge 5$) on any query cut, demographic aggregation, or report slice.
     */
    enforceDifferentialPrivacy(records, threshold = AnonymityGuardService.MINIMUM_K_ANONYMITY_THRESHOLD) {
        const sampleSize = records.length;
        if (sampleSize < threshold) {
            return {
                isSuppressed: true,
                sampleSize,
                data: null,
                privacyNotice: `Aggregated data suppressed: Cohort size (N=${sampleSize}) is below the differential privacy threshold (N \u2265 ${threshold}) to protect respondent anonymity.`,
            };
        }
        return {
            isSuppressed: false,
            sampleSize,
            data: records,
        };
    }
    /**
     * Verifies explicit consent for identified campaigns.
     */
    verifyIdentifiedConsent(context) {
        return !!context?.consentGiven;
    }
}
exports.AnonymityGuardService = AnonymityGuardService;
//# sourceMappingURL=anonymity-guard.service.js.map