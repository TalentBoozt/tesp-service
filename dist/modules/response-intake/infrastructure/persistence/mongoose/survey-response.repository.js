"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
            matrixNodeIds: doc.matrixNodeIds || [],
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
            matrixNodeIds: raw.matrixNodeIds,
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
        if (filter?.nodeId && filter.nodeId !== 'GLOBAL' && filter.nodeId !== 'ALL') {
            const targetNodeId = filter.nodeId;
            const matchedNodeIds = new Set([targetNodeId]);
            const deptNames = new Set();
            try {
                if (mongoose_1.default.connection.readyState === 1) {
                    const { OrgNodeModel } = await Promise.resolve().then(() => __importStar(require('../../../../organization/infrastructure/persistence/mongoose/org-node.schema')));
                    const allNodes = await OrgNodeModel.find({
                        $or: [{ projectId }, { projectId: { $exists: true } }],
                        isDeleted: { $ne: true },
                    }).lean();
                    // Find current node name
                    const thisNode = allNodes.find((n) => (n.nodeId || n.nodeCode) === targetNodeId);
                    if (thisNode?.name) {
                        deptNames.add(thisNode.name);
                    }
                    // Breadth-first search for all descendant nodes
                    const queue = [targetNodeId];
                    while (queue.length > 0) {
                        const current = queue.shift();
                        for (const n of allNodes) {
                            const code = n.nodeId || n.nodeCode;
                            if (n.parentId === current && code && !matchedNodeIds.has(code)) {
                                matchedNodeIds.add(code);
                                if (n.name)
                                    deptNames.add(n.name);
                                queue.push(code);
                            }
                        }
                    }
                }
            }
            catch {
                // Fallback to targetNodeId
            }
            const nodeIdsList = Array.from(matchedNodeIds);
            const orClauses = [
                { nodeId: { $in: nodeIdsList } },
                { matrixNodeIds: { $in: nodeIdsList } },
                { 'demographicSnapshot.matrixNodeIds': { $in: nodeIdsList } },
                { 'demographicSnapshot.secondaryNodeIds': { $in: nodeIdsList } },
            ];
            for (const dName of deptNames) {
                const escaped = dName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`^\\s*${escaped}\\s*$`, 'i');
                orClauses.push({ 'demographicSnapshot.department': { $regex: regex } }, { 'demographicSnapshot.Department': { $regex: regex } });
            }
            matchQuery.$or = orClauses;
        }
        if (filter?.demographicFilters) {
            const filterConditions = [];
            for (const [k, v] of Object.entries(filter.demographicFilters)) {
                if (v && v !== 'ALL' && typeof v === 'string') {
                    const kLower = k.toLowerCase();
                    const kCap = k.charAt(0).toUpperCase() + k.slice(1);
                    const escapedV = v.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`^\\s*${escapedV}\\s*$`, 'i');
                    const numV = Number(v);
                    const orClauses = [
                        { [`demographicSnapshot.${k}`]: { $regex: regex } },
                        { [`demographicSnapshot.${kLower}`]: { $regex: regex } },
                        { [`demographicSnapshot.${kCap}`]: { $regex: regex } },
                        { [`demographicSnapshot.${k}`]: v },
                        { [`demographicSnapshot.${kLower}`]: v },
                        { [`demographicSnapshot.${kCap}`]: v },
                        { 'answers.textValue': { $regex: regex } },
                        { 'answers.selectedOptions': v },
                        { 'answers.choiceValues': v },
                    ];
                    if (!isNaN(numV)) {
                        orClauses.push({ [`demographicSnapshot.${k}`]: numV }, { [`demographicSnapshot.${kLower}`]: numV }, { [`demographicSnapshot.${kCap}`]: numV });
                    }
                    filterConditions.push({ $or: orClauses });
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
                        {
                            $match: {
                                'answers.numericValue': { $ne: null },
                                $or: [
                                    { 'answers.questionType': { $regex: /^nps/i } },
                                    { 'answers.groupId': { $regex: /enps|nps|recommend|loyalty/i } },
                                    { 'answers.questionId': { $regex: /enps|nps|recommend|loyalty/i } },
                                ],
                            },
                        },
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