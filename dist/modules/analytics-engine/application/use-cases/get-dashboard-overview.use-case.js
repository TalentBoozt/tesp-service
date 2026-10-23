"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardOverviewUseCase = void 0;
const employee_schema_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.schema");
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
const action_plan_schema_1 = require("../../../action-planning/infrastructure/persistence/mongoose/action-plan.schema");
class GetDashboardOverviewUseCase {
    employeeModel;
    campaignModel;
    responseModel;
    actionPlanModel;
    constructor(employeeModel = employee_schema_1.EmployeeModel, campaignModel = campaign_schema_1.CampaignModel, responseModel = survey_response_schema_1.SurveyResponseModel, actionPlanModel = action_plan_schema_1.ActionPlanModel) {
        this.employeeModel = employeeModel;
        this.campaignModel = campaignModel;
        this.responseModel = responseModel;
        this.actionPlanModel = actionPlanModel;
    }
    async execute(projectId) {
        // 1. Count active employees
        const totalEmployees = await this.employeeModel.countDocuments({
            projectId,
            isDeleted: { $ne: true },
            status: 'ACTIVE',
        });
        // 2. Count active campaigns
        const activeCampaignsCount = await this.campaignModel.countDocuments({
            projectId,
            isDeleted: { $ne: true },
            status: 'ACTIVE',
        });
        // 3. Query recent campaigns (top 5)
        const recentCampaignDocs = await this.campaignModel
            .find({ projectId, isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        // 4. Query total responses for this project
        const totalResponses = await this.responseModel.countDocuments({
            projectId,
            isDeleted: { $ne: true },
        });
        // 5. Query open action plans
        const openActionPlansCount = await this.actionPlanModel.countDocuments({
            projectId,
            isDeleted: { $ne: true },
            status: { $in: ['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW'] },
        });
        // 6. Build recent campaign summaries with real response counts
        let totalTargetSum = 0;
        const recentCampaigns = [];
        for (const c of recentCampaignDocs) {
            const targetCount = c.metrics?.totalTargeted || c.targetCount || c.sentCount || 0;
            totalTargetSum += targetCount;
            // Count actual responses for this campaign
            const actualResponseCount = await this.responseModel.countDocuments({
                projectId,
                campaignId: c.campaignId,
                isDeleted: { $ne: true },
            });
            const responseCount = Math.max(actualResponseCount, c.metrics?.completed || 0);
            const completionRate = targetCount > 0 ? Number(((responseCount / targetCount) * 100).toFixed(1)) : 0;
            const primaryChannel = Array.isArray(c.channels) && c.channels.length > 0 ? c.channels[0] : (c.channel || 'EMAIL');
            recentCampaigns.push({
                id: c._id?.toString() || c.campaignId,
                campaignId: c.campaignId,
                title: c.title,
                status: c.status,
                channel: primaryChannel,
                sentCount: targetCount,
                responseCount,
                completionRate,
                createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            });
        }
        const overallResponseRate = totalTargetSum > 0
            ? Number(((totalResponses / totalTargetSum) * 100).toFixed(1))
            : 0;
        return {
            totalEmployees,
            activeCampaignsCount,
            overallResponseRate,
            openActionPlansCount,
            recentCampaigns,
        };
    }
}
exports.GetDashboardOverviewUseCase = GetDashboardOverviewUseCase;
//# sourceMappingURL=get-dashboard-overview.use-case.js.map