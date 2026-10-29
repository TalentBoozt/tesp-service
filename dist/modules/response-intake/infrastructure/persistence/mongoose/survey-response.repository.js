"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseMongoRepository = void 0;
const survey_response_entity_1 = require("../../../domain/entities/survey-response.entity");
const survey_response_schema_1 = require("./survey-response.schema");
class SurveyResponseMongoRepository {
    toEntity(doc) {
        return new survey_response_entity_1.SurveyResponseEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            surveyId: doc.surveyId,
            surveyVersion: doc.surveyVersion,
            responseId: doc.responseId,
            respondentType: doc.respondentType,
            responseToken: doc.responseToken,
            nodeId: doc.nodeId,
            demographicSnapshot: doc.demographicSnapshot,
            answers: doc.answers,
            submittedAt: doc.submittedAt,
            isDeleted: doc.isDeleted,
        });
    }
    async save(response) {
        const raw = response.toJSON();
        const doc = await survey_response_schema_1.SurveyResponseModel.create({
            projectId: raw.projectId,
            campaignId: raw.campaignId,
            surveyId: raw.surveyId,
            surveyVersion: raw.surveyVersion,
            responseId: raw.responseId,
            respondentType: raw.respondentType,
            responseToken: raw.responseToken,
            nodeId: raw.nodeId,
            demographicSnapshot: raw.demographicSnapshot,
            answers: raw.answers,
            submittedAt: raw.submittedAt,
            isDeleted: raw.isDeleted,
        });
        return this.toEntity(doc);
    }
    async findByResponseId(projectId, responseId) {
        const doc = await survey_response_schema_1.SurveyResponseModel.findOne({ projectId, responseId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAllByCampaign(projectId, campaignId, options) {
        const query = { projectId, campaignId, isDeleted: false };
        const limit = options?.limit || 50;
        const offset = options?.offset || 0;
        const [docs, total] = await Promise.all([
            survey_response_schema_1.SurveyResponseModel.find(query).sort({ submittedAt: -1 }).skip(offset).limit(limit),
            survey_response_schema_1.SurveyResponseModel.countDocuments(query),
        ]);
        return {
            responses: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async aggregateDashboardStats(projectId, campaignId, filter) {
        const matchQuery = { projectId, campaignId, isDeleted: false };
        if (filter?.nodeId && filter.nodeId !== 'GLOBAL') {
            matchQuery.nodeId = filter.nodeId;
        }
        if (filter?.demographicFilters) {
            const filterConditions = [];
            for (const [k, v] of Object.entries(filter.demographicFilters)) {
                if (v && v !== 'ALL' && typeof v === 'string') {
                    const kLower = k.toLowerCase();
                    const escapedV = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`^${escapedV}$`, 'i');
                    filterConditions.push({
                        $or: [
                            { [`demographicSnapshot.${k}`]: { $regex: regex } },
                            { [`demographicSnapshot.${kLower}`]: { $regex: regex } },
                            { 'answers.textValue': { $regex: regex } },
                            { 'answers.selectedOptions': v },
                            { 'answers.choiceValues': v },
                        ],
                    });
                }
            }
            if (filterConditions.length > 0) {
                matchQuery.$and = filterConditions;
            }
        }
        const pipeline = [
            { $match: matchQuery },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    npsAnswers: [
                        { $unwind: '$answers' },
                        { $match: { 'answers.questionType': 'NPS', 'answers.numericValue': { $ne: null } } },
                        {
                            $group: {
                                _id: null,
                                totalNps: { $sum: 1 },
                                avgNpsScore: { $avg: '$answers.numericValue' },
                                promoters: {
                                    $sum: { $cond: [{ $gte: ['$answers.numericValue', 9] }, 1, 0] },
                                },
                                passives: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ['$answers.numericValue', 7] },
                                                    { $lte: ['$answers.numericValue', 8] },
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                detractors: {
                                    $sum: { $cond: [{ $lte: ['$answers.numericValue', 6] }, 1, 0] },
                                },
                            },
                        },
                    ],
                    dimensionAnswers: [
                        { $unwind: '$answers' },
                        {
                            $match: {
                                'answers.numericValue': { $ne: null },
                                'answers.questionType': { $in: ['LIKERT', 'NUMERIC', 'RATING'] },
                            },
                        },
                        {
                            $group: {
                                _id: { $ifNull: ['$answers.groupId', '$answers.category', 'general'] },
                                avgScore: { $avg: '$answers.numericValue' },
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                groupId: '$_id',
                                avgScore: '$avgScore',
                                count: '$count',
                            },
                        },
                    ],
                },
            },
        ];
        const [result] = await survey_response_schema_1.SurveyResponseModel.aggregate(pipeline);
        const totalResponses = result?.total?.[0]?.count || 0;
        const nps = result?.npsAnswers?.[0] || {
            promoters: 0,
            passives: 0,
            detractors: 0,
            totalNps: 0,
            avgNpsScore: 0,
        };
        const dimensionStats = result?.dimensionAnswers || [];
        return {
            totalResponses,
            npsStats: nps,
            dimensionStats,
        };
    }
    async aggregateHeatmapByDepartment(projectId, campaignId) {
        const pipeline = [
            { $match: { projectId, campaignId, isDeleted: false } },
            { $unwind: '$answers' },
            { $match: { 'answers.numericValue': { $ne: null } } },
            {
                $group: {
                    _id: {
                        nodeId: { $ifNull: ['$nodeId', 'GLOBAL'] },
                        groupId: {
                            $cond: [
                                { $eq: ['$answers.questionType', 'NPS'] },
                                'enps',
                                { $ifNull: ['$answers.groupId', '$answers.category', 'growth_learning'] },
                            ],
                        },
                    },
                    avgScore: { $avg: '$answers.numericValue' },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    nodeId: '$_id.nodeId',
                    groupId: '$_id.groupId',
                    avgScore: '$avgScore',
                    count: '$count',
                },
            },
        ];
        return await survey_response_schema_1.SurveyResponseModel.aggregate(pipeline);
    }
    async findSubmissionTimestamps(projectId, nodeId) {
        const query = { projectId, isDeleted: false };
        if (nodeId && nodeId !== 'GLOBAL') {
            query.nodeId = nodeId;
        }
        const docs = await survey_response_schema_1.SurveyResponseModel.find(query, { submittedAt: 1 }).lean();
        return docs.map((d) => d.submittedAt).filter(Boolean);
    }
}
exports.SurveyResponseMongoRepository = SurveyResponseMongoRepository;
//# sourceMappingURL=survey-response.repository.js.map