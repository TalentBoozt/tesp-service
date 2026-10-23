import { AnonymityLevel } from '../../../survey-distribution/domain/entities/campaign.entity';
import { SurveyResponseProps } from '../entities/survey-response.entity';
export interface RawSubmissionContext {
    ipAddress?: string;
    userAgent?: string;
    employeeId?: string;
    email?: string;
    respondentName?: string;
    responseToken?: string;
    consentGiven?: boolean;
    consentTimestamp?: Date;
    metadata?: Record<string, any>;
}
export interface SanitizedSubmissionResult {
    sanitizedProps: Partial<SurveyResponseProps>;
    isDecoupled: boolean;
    strippedFields: string[];
}
export interface DifferentialPrivacyResult<T> {
    isSuppressed: boolean;
    sampleSize: number;
    data: T[] | null;
    privacyNotice?: string;
}
export declare class ConsentRequiredError extends Error {
    constructor(message?: string);
}
export declare class AnonymityGuardService {
    static readonly MINIMUM_K_ANONYMITY_THRESHOLD = 5;
    /**
     * Sanitizes and isolates response data based on the campaign anonymity archetype.
     */
    sanitizeForIngestion(props: SurveyResponseProps, anonymityLevel: AnonymityLevel, context?: RawSubmissionContext): SanitizedSubmissionResult;
    /**
     * Enforces differential privacy ($N \ge 5$) on any query cut, demographic aggregation, or report slice.
     */
    enforceDifferentialPrivacy<T>(records: T[], threshold?: number): DifferentialPrivacyResult<T>;
    /**
     * Verifies explicit consent for identified campaigns.
     */
    verifyIdentifiedConsent(context?: RawSubmissionContext): boolean;
}
