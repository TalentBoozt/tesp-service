"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEmployeeSurveyHistoryUseCase = void 0;
const employee_schema_1 = require("../../infrastructure/persistence/mongoose/employee.schema");
const token_vault_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
class GetEmployeeSurveyHistoryUseCase {
    async execute(projectId, employeeId) {
        // 1. Resolve employee
        const employee = await employee_schema_1.EmployeeModel.findOne({
            projectId,
            isDeleted: false,
            $or: [
                { employeeId },
                { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : null },
                { email: employeeId },
            ],
        }).lean();
        if (!employee) {
            return [];
        }
        // 2. Query tokens directly assigned to this employee
        const tokens = await token_vault_schema_1.TokenVaultModel.find({
            projectId,
            $or: [
                { employeeId: employee.employeeId },
                { employeeId: employee._id ? employee._id.toString() : undefined },
            ],
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
                    targetNodes.includes(employee.nodeId);
                if (isTargeted) {
                    // Check if response exists for this campaign & node
                    const responseExists = await survey_response_schema_1.SurveyResponseModel.findOne({
                        projectId,
                        campaignId: campaign.campaignId,
                        nodeId: employee.nodeId,
                    }).lean();
                    result.push({
                        id: `hist-${campaign.campaignId}-${employee.employeeId}`,
                        campaignId: campaign.campaignId,
                        title: campaign.title,
                        status: responseExists ? 'COMPLETED' : 'PENDING',
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