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
exports.GetEmployeeSurveyHistoryUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employee_schema_1 = require("../../infrastructure/persistence/mongoose/employee.schema");
const token_vault_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
class GetEmployeeSurveyHistoryUseCase {
    async execute(projectId, employeeId) {
        if (!employeeId || !projectId) {
            return [];
        }
        const candidateIds = new Set();
        candidateIds.add(employeeId.trim());
        // Resolve user account if employeeId is user ID or email (only if connected in production)
        if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const { UserModel } = await Promise.resolve().then(() => __importStar(require('../../../auth/infrastructure/persistence/user.schema')));
                const userDoc = await UserModel.findOne({
                    $or: [{ userId: employeeId }, { employeeId }, { email: employeeId }],
                }).lean();
                if (userDoc?.employeeId)
                    candidateIds.add(userDoc.employeeId);
                if (userDoc?.email)
                    candidateIds.add(userDoc.email.trim().toLowerCase());
            }
            catch { }
        }
        // 1. Resolve employee
        const orConditions = [];
        // Ensure primary employeeId is first condition to preserve compatibility with existing unit test spies
        orConditions.push({ employeeId });
        for (const cid of candidateIds) {
            if (cid !== employeeId) {
                orConditions.push({ employeeId: cid });
            }
            orConditions.push({ employeeCode: cid });
            if (cid.match(/^[0-9a-fA-F]{24}$/)) {
                orConditions.push({ _id: cid });
            }
        }
        try {
            const { FieldEncryptionService } = await Promise.resolve().then(() => __importStar(require('../../../../shared/infrastructure/security/field-encryption.service')));
            for (const cid of candidateIds) {
                if (cid.includes('@')) {
                    orConditions.push({ emailBlindIndex: FieldEncryptionService.blindIndex(cid) });
                }
            }
        }
        catch { }
        const employee = await employee_schema_1.EmployeeModel.findOne({
            projectId,
            isDeleted: false,
            $or: orConditions,
        }).lean();
        if (!employee) {
            return [];
        }
        if (employee.employeeId)
            candidateIds.add(employee.employeeId);
        if (employee.employeeCode)
            candidateIds.add(employee.employeeCode);
        if (employee._id)
            candidateIds.add(employee._id.toString());
        // 2. Query tokens directly assigned to this employee
        const tokenQueryOr = [];
        for (const cid of candidateIds) {
            tokenQueryOr.push({ employeeId: cid });
        }
        const tokens = await token_vault_schema_1.TokenVaultModel.find({
            projectId,
            $or: tokenQueryOr.length > 0 ? tokenQueryOr : [{ employeeId: employee.employeeId }],
        }).lean();
        // 3. Query all campaigns for this project
        const allCampaigns = await campaign_schema_1.CampaignModel.find({
            projectId,
            isDeleted: false,
        }).lean();
        const campaignMap = new Map(allCampaigns.map((c) => [c.campaignId, c]));
        const result = [];
        const recordedCampaignIds = new Set();
        // 4. Map direct tokens
        for (const token of tokens) {
            const campaign = campaignMap.get(token.campaignId);
            const isCompleted = token.isBurned;
            recordedCampaignIds.add(token.campaignId);
            result.push({
                id: token._id ? token._id.toString() : token.token,
                campaignId: token.campaignId,
                title: campaign ? campaign.title : `Campaign ${token.campaignId}`,
                status: isCompleted ? 'COMPLETED' : 'PENDING',
                date: token.createdAt
                    ? token.createdAt.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                channel: (campaign?.channels && campaign.channels[0]) || 'EMAIL',
            });
        }
        // 5. Check if other campaigns targeted this employee's node
        if (employee.nodeId) {
            for (const campaign of allCampaigns) {
                if (recordedCampaignIds.has(campaign.campaignId))
                    continue;
                const targetNodes = campaign.targetAudience?.nodeIds || [];
                const isTargeted = targetNodes.length === 0 ||
                    targetNodes.includes('GLOBAL') ||
                    targetNodes.includes('*') ||
                    targetNodes.includes(employee.nodeId);
                if (isTargeted) {
                    // Check if a participant token was allocated to this specific employee (GAP-014 / TASK-012)
                    const employeeToken = await token_vault_schema_1.TokenVaultModel.findOne({
                        projectId,
                        campaignId: campaign.campaignId,
                        $or: tokenQueryOr.length > 0 ? tokenQueryOr : [{ employeeId: employee.employeeId }],
                    }).lean();
                    const isCompleted = employeeToken ? employeeToken.isBurned : false;
                    result.push({
                        id: `hist-${campaign.campaignId}-${employee.employeeId}`,
                        campaignId: campaign.campaignId,
                        title: campaign.title,
                        status: isCompleted ? 'COMPLETED' : 'PENDING',
                        date: campaign.startDate
                            ? campaign.startDate.toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0],
                        channel: (campaign.channels && campaign.channels[0]) || 'EMAIL',
                    });
                }
            }
        }
        return result;
    }
}
exports.GetEmployeeSurveyHistoryUseCase = GetEmployeeSurveyHistoryUseCase;
//# sourceMappingURL=get-employee-survey-history.use-case.js.map