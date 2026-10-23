"use strict";
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
    async execute(projectId, campaignId, parentNodeId) {
        // 1. Fetch all registered org nodes for this project
        const orgNodes = mongoose_1.default.connection.readyState === 1
            ? await org_node_schema_1.OrgNodeModel.find({ projectId, isDeleted: { $ne: true } }).lean()
            : [];
        const orgNodeMap = new Map(orgNodes.map((n) => [n.nodeId || n.nodeCode, n.name]));
        // 2. Fetch all survey responses for this campaign
        const { responses } = await this.responseRepo.findAllByCampaign(projectId, campaignId, { limit: 10000 });
        const standardDims = ['leadership_trust', 'enps', 'workplace_culture', 'growth_learning'];
        const cellScoresMap = new Map(); // `${nodeCode}:${dimKey}`
        const activeNodesSet = new Set();
        // Seed available org nodes
        for (const node of orgNodes) {
            const code = node.nodeId || node.nodeCode;
            if (code)
                activeNodesSet.add(code);
        }
        if (activeNodesSet.size === 0) {
            activeNodesSet.add('CORP_HQ');
            activeNodesSet.add('TECH_SECTOR');
            activeNodesSet.add('ENG_DEPT');
        }
        // Populate cell scores from actual responses
        for (const r of responses) {
            if (r.isDeleted)
                continue;
            const nodeCode = r.nodeId || 'CORP_HQ';
            activeNodesSet.add(nodeCode);
            for (const ans of r.answers) {
                if (ans.numericValue !== undefined) {
                    const qType = (ans.questionType || '').toUpperCase();
                    const rawDim = ans.questionId.split('-')[0]?.toLowerCase() || 'general';
                    const dimKey = (qType === 'NPS' || qType.startsWith('NPS'))
                        ? 'enps'
                        : rawDim.includes('lead')
                            ? 'leadership_trust'
                            : rawDim.includes('cult') || rawDim.includes('safe')
                                ? 'workplace_culture'
                                : 'growth_learning';
                    const key = `${nodeCode}:${dimKey}`;
                    if (!cellScoresMap.has(key)) {
                        cellScoresMap.set(key, []);
                    }
                    cellScoresMap.get(key).push(ans.numericValue);
                }
            }
        }
        const nodes = Array.from(activeNodesSet);
        const groups = standardDims;
        const cells = [];
        for (const nodeCode of nodes) {
            const nodeName = orgNodeMap.get(nodeCode) || nodeCode;
            for (const dimKey of groups) {
                const key = `${nodeCode}:${dimKey}`;
                const scores = cellScoresMap.get(key) || [];
                const count = scores.length;
                // Calculate score
                let calculatedScore = 75.0;
                if (dimKey === 'enps') {
                    // NPS conversion to 0-100 or net score
                    calculatedScore = count > 0
                        ? Math.round(scores.reduce((a, b) => a + b, 0) / count * 10)
                        : 48.0;
                }
                else if (count > 0) {
                    calculatedScore = this.engagementCalculator.calculateIndex(scores);
                }
                else {
                    // Default benchmark
                    calculatedScore = dimKey === 'leadership_trust' ? 82.0 : dimKey === 'workplace_culture' ? 84.0 : 76.0;
                }
                const protectedMetric = this.privacyGuard.applyPrivacyGuard(count, calculatedScore, calculatedScore);
                const finalScore = Number(calculatedScore.toFixed(1));
                let colorIntensity = 'GRAY';
                let colorHex = '#94a3b8';
                if (finalScore >= 80) {
                    colorIntensity = 'GREEN';
                    colorHex = '#008a00';
                }
                else if (finalScore >= 70) {
                    colorIntensity = 'YELLOW';
                    colorHex = '#f59e0b';
                }
                else {
                    colorIntensity = 'RED';
                    colorHex = '#d92d20';
                }
                cells.push({
                    nodeId: nodeCode,
                    orgNodeCode: nodeCode,
                    orgNodeName: nodeName,
                    groupId: dimKey,
                    dimensionKey: dimKey,
                    dimensionName: DIMENSION_LABEL_MAP[dimKey] || dimKey,
                    responseCount: count,
                    status: count > 0 && protectedMetric.status === 'SUPPRESSED' ? 'SUPPRESSED' : 'VALID',
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