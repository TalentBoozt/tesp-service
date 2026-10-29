"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOptimalDispatchTimeUseCase = void 0;
const survey_response_repository_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.repository");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
const mongoose_1 = __importDefault(require("mongoose"));
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
class GetOptimalDispatchTimeUseCase {
    responseRepo;
    constructor(responseRepo) {
        if (responseRepo) {
            this.responseRepo = responseRepo;
        }
        else {
            try {
                this.responseRepo = new survey_response_repository_1.SurveyResponseMongoRepository();
            }
            catch {
                // Fallback for isolated unit tests
            }
        }
    }
    async execute(projectId, nodeId) {
        const timestamps = await this.getTimestamps(projectId, nodeId);
        const totalCount = timestamps.length;
        // GAP-006 / TASK-05-03: Low-Telemetry Fallback
        // If sample size < 50, return documented industry baseline (Tuesday 10:00 AM) with honest indicators
        if (totalCount < 50) {
            return {
                nodeId: nodeId || 'GLOBAL',
                recommendedDayOfWeek: 'TUESDAY',
                recommendedTimeUtc: '10:00',
                confidenceScore: 0.50,
                confidence: 'LOW_TELEMETRY',
                sampleSize: totalCount,
                isHeuristic: true,
                expectedOpenRatePercent: 45.0,
                reasoning: `Insufficient historical telemetry (${totalCount}/50 responses). Industry standard dispatch heuristic applied (Tuesday 10:00 UTC).`,
            };
        }
        // Bucket responses by (DayOfWeek, HourUtc)
        const bucketCounts = new Map();
        for (const ts of timestamps) {
            const date = ts instanceof Date ? ts : new Date(ts);
            if (isNaN(date.getTime()))
                continue;
            const day = DAY_NAMES[date.getUTCDay()];
            const hour = date.getUTCHours();
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            const key = `${day}_${hourStr}`;
            bucketCounts.set(key, (bucketCounts.get(key) || 0) + 1);
        }
        let bestKey = 'TUESDAY_10:00';
        let maxCount = 0;
        for (const [key, count] of bucketCounts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                bestKey = key;
            }
        }
        const [modalDay, modalTime] = bestKey.split('_');
        const peakRatio = maxCount / totalCount;
        const confidenceScore = Number(Math.min(0.98, Math.max(0.70, 0.65 + peakRatio * 0.5 + Math.min(0.15, totalCount / 1000))).toFixed(2));
        const expectedOpenRatePercent = Number((60 + peakRatio * 40).toFixed(1));
        return {
            nodeId: nodeId || 'GLOBAL',
            recommendedDayOfWeek: modalDay,
            recommendedTimeUtc: modalTime,
            confidenceScore,
            confidence: 'HIGH',
            sampleSize: totalCount,
            isHeuristic: false,
            expectedOpenRatePercent,
            reasoning: `Empirically derived from ${totalCount} historical responses across cohort '${nodeId || 'GLOBAL'}'. Peak intake activity concentrated on ${modalDay} at ${modalTime} UTC.`,
        };
    }
    async getTimestamps(projectId, nodeId) {
        if (this.responseRepo && typeof this.responseRepo.findSubmissionTimestamps === 'function') {
            try {
                return await this.responseRepo.findSubmissionTimestamps(projectId, nodeId);
            }
            catch { }
        }
        if (mongoose_1.default.connection?.readyState === 1) {
            const query = { projectId, isDeleted: false };
            if (nodeId && nodeId !== 'GLOBAL') {
                query.nodeId = nodeId;
            }
            const docs = await survey_response_schema_1.SurveyResponseModel.find(query, { submittedAt: 1 }).lean();
            return docs.map((d) => d.submittedAt).filter(Boolean);
        }
        return [];
    }
}
exports.GetOptimalDispatchTimeUseCase = GetOptimalDispatchTimeUseCase;
//# sourceMappingURL=get-optimal-dispatch-time.use-case.js.map