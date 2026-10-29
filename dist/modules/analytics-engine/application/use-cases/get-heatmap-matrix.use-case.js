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
exports.GetHeatmapMatrixUseCase = void 0;
const privacy_guard_service_1 = require("../../domain/services/privacy-guard.service");
const engagement_index_calculator_1 = require("../../domain/services/engagement-index.calculator");
const mongoose_1 = __importDefault(require("mongoose"));
const org_node_schema_1 = require("../../../organization/infrastructure/persistence/mongoose/org-node.schema");
const DIMENSION_LABEL_MAP = {
    leadership_trust: 'Leadership & Vision Trust',
    enps: 'Employee Net Promoter Score (eNPS)',
    workplace_culture: 'Workplace Inclusion & Safety',
    growth_learning: 'Career Growth & Development',
};
class GetHeatmapMatrixUseCase {
    responseRepo;
    privacyGuard;
    engagementCalculator;
    constructor(responseRepo) {
        this.responseRepo = responseRepo;
        this.privacyGuard = new privacy_guard_service_1.PrivacyGuardService();
        this.engagementCalculator = new engagement_index_calculator_1.EngagementIndexCalculatorService();
    }
    async execute(projectId, campaignId, parentNodeId, bypassPrivacy = false) {
        // 1. Fetch all registered org nodes for this project
        const orgNodes = mongoose_1.default.connection.readyState === 1
            ? await org_node_schema_1.OrgNodeModel.find({ projectId, isDeleted: { $ne: true } }).lean()
            : [];
        const orgNodeMap = new Map(orgNodes.map((n) => [n.nodeId || n.nodeCode, n.name]));
        // 2. Map question taxonomy from Survey AST (GAP-017 / GAP-011)
        const questionCategoryMap = new Map();
        const surveyCategoriesSet = new Set();
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const { CampaignModel } = await Promise.resolve().then(() => __importStar(require('../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema')));
                const campaign = await CampaignModel.findOne({ projectId, campaignId }).lean();
                if (campaign) {
                    if (campaign.anonymityLevel === 'AUTHENTICATED') {
                        bypassPrivacy = true;
                    }
                    if (campaign.surveyId) {
                        const { SurveyModel } = await Promise.resolve().then(() => __importStar(require('../../../survey/infrastructure/persistence/mongoose/survey.schema')));
                        const survey = await SurveyModel.findOne({ projectId, surveyId: campaign.surveyId }).lean();
                        if (survey?.pages) {
                            for (const page of survey.pages) {
                                for (const sec of (page.sections || [])) {
                                    for (const q of (sec.questions || [])) {
                                        const rawCat = q.category || q.groupId || q.metadata?.driver;
                                        const cat = (rawCat || (q.type === 'NPS' ? 'enps' : 'general'))
                                            .toLowerCase()
                                            .replace(/-/g, '_');
                                        questionCategoryMap.set(q.questionId, cat);
                                        surveyCategoriesSet.add(cat);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch {
                // Fallback to response answer metadata
            }
        }
        // 3. Fetch survey responses for this campaign
        const { responses } = await this.responseRepo.findAllByCampaign(projectId, campaignId, { limit: 10000 });
        const cellScoresMap = new Map(); // `${nodeCode}:${dimKey}`
        const activeNodesSet = new Set();
        const detectedCategoriesSet = new Set();
        // Seed available org nodes if any exist
        for (const node of orgNodes) {
            const code = node.nodeId || node.nodeCode;
            if (code)
                activeNodesSet.add(code);
        }
        // Populate cell scores from actual responses
        for (const r of responses) {
            if (r.isDeleted)
                continue;
            const nodeCode = r.nodeId || 'GLOBAL';
            activeNodesSet.add(nodeCode);
            for (const ans of r.answers) {
                if (ans.numericValue !== undefined && ans.numericValue !== null) {
                    const qType = (ans.questionType || '').toUpperCase();
                    let dimKey = '';
                    if (qType === 'NPS' || qType.startsWith('NPS')) {
                        dimKey = 'enps';
                    }
                    else if (questionCategoryMap.has(ans.questionId)) {
                        dimKey = questionCategoryMap.get(ans.questionId);
                    }
                    else if (ans.category) {
                        dimKey = ans.category.toLowerCase().replace(/-/g, '_');
                    }
                    else if (ans.groupId) {
                        dimKey = ans.groupId.toLowerCase().replace(/-/g, '_');
                    }
                    else if (ans.metadata?.driver) {
                        dimKey = ans.metadata.driver.toLowerCase().replace(/-/g, '_');
                    }
                    else if (ans.questionId.startsWith('GRP-')) {
                        const parts = ans.questionId.split('-');
                        dimKey = parts[1]?.toLowerCase().replace(/-/g, '_') || 'general';
                    }
                    else {
                        dimKey = 'general';
                    }
                    detectedCategoriesSet.add(dimKey);
                    const key = `${nodeCode}:${dimKey}`;
                    if (!cellScoresMap.has(key)) {
                        cellScoresMap.set(key, []);
                    }
                    cellScoresMap.get(key).push(Number(ans.numericValue));
                }
            }
        }
        const nodes = Array.from(activeNodesSet);
        if (nodes.length === 0) {
            nodes.push('GLOBAL');
        }
        // Dynamic taxonomy: use configured survey categories, followed by response-detected categories
        let groups;
        if (surveyCategoriesSet.size > 0) {
            groups = Array.from(new Set([...surveyCategoriesSet, ...detectedCategoriesSet]));
        }
        else if (detectedCategoriesSet.size > 0) {
            groups = Array.from(detectedCategoriesSet);
        }
        else {
            groups = ['leadership_trust', 'enps', 'workplace_culture', 'growth_learning'];
        }
        const cells = [];
        for (const nodeCode of nodes) {
            const nodeName = orgNodeMap.get(nodeCode) || nodeCode;
            for (const dimKey of groups) {
                const key = `${nodeCode}:${dimKey}`;
                const scores = cellScoresMap.get(key) || [];
                const count = scores.length;
                let calculatedScore = 0;
                let isSuppressed = !bypassPrivacy && count < 5;
                if (count > 0) {
                    if (dimKey === 'enps') {
                        // Standard Net Promoter formula: (% Promoters - % Detractors) * 100
                        // Scale 0-10: Promoters (9-10), Passives (7-8), Detractors (0-6)
                        let promoters = 0;
                        let detractors = 0;
                        let passives = 0;
                        for (const val of scores) {
                            if (val >= 9)
                                promoters++;
                            else if (val <= 6)
                                detractors++;
                            else
                                passives++;
                        }
                        calculatedScore = Math.round(((promoters - detractors) / count) * 100);
                    }
                    else {
                        calculatedScore = this.engagementCalculator.calculateIndex(scores);
                    }
                }
                const finalScore = Number(calculatedScore.toFixed(1));
                let colorIntensity = 'GRAY';
                let colorHex = '#94a3b8';
                if (count >= 5 || (bypassPrivacy && count > 0)) {
                    if (dimKey === 'enps') {
                        // eNPS scale (-100 to +100): >= +30 is green, >= 0 is yellow, < 0 is red
                        if (finalScore >= 30) {
                            colorIntensity = 'GREEN';
                            colorHex = '#008a00';
                        }
                        else if (finalScore >= 0) {
                            colorIntensity = 'YELLOW';
                            colorHex = '#f59e0b';
                        }
                        else {
                            colorIntensity = 'RED';
                            colorHex = '#d92d20';
                        }
                    }
                    else {
                        // Standard scale (0-100): >= 75 is green, >= 65 is yellow, < 65 is red
                        if (finalScore >= 75) {
                            colorIntensity = 'GREEN';
                            colorHex = '#008a00';
                        }
                        else if (finalScore >= 65) {
                            colorIntensity = 'YELLOW';
                            colorHex = '#f59e0b';
                        }
                        else {
                            colorIntensity = 'RED';
                            colorHex = '#d92d20';
                        }
                    }
                }
                const dimensionName = DIMENSION_LABEL_MAP[dimKey] ||
                    dimKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                cells.push({
                    nodeId: nodeCode,
                    orgNodeCode: nodeCode,
                    orgNodeName: nodeName,
                    groupId: dimKey,
                    dimensionKey: dimKey,
                    dimensionName,
                    responseCount: count,
                    status: isSuppressed ? 'SUPPRESSED' : 'VALID',
                    score: finalScore,
                    colorIntensity,
                    colorHex,
                });
            }
        }
        return {
            projectId,
            campaignId,
            nodes,
            groups,
            cells,
        };
    }
}
exports.GetHeatmapMatrixUseCase = GetHeatmapMatrixUseCase;
//# sourceMappingURL=get-heatmap-matrix.use-case.js.map