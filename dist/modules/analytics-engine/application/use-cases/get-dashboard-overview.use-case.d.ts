export interface RecentCampaignOverviewDto {
    id: string;
    campaignId: string;
    title: string;
    status: string;
    channel: string;
    sentCount: number;
    responseCount: number;
    completionRate: number;
    createdAt: string;
}
export interface DashboardOverviewDto {
    totalEmployees: number;
    activeCampaignsCount: number;
    overallResponseRate: number;
    openActionPlansCount: number;
    recentCampaigns: RecentCampaignOverviewDto[];
}
export declare class GetDashboardOverviewUseCase {
    private employeeModel;
    private campaignModel;
    private responseModel;
    private actionPlanModel;
    constructor(employeeModel?: import("mongoose").Model<import("../../../employee/infrastructure/persistence/mongoose/employee.schema").IEmployeeDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../../../employee/infrastructure/persistence/mongoose/employee.schema").IEmployeeDocument, {}, {}> & import("../../../employee/infrastructure/persistence/mongoose/employee.schema").IEmployeeDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, campaignModel?: import("mongoose").Model<import("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema").ICampaignDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema").ICampaignDocument, {}, {}> & import("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema").ICampaignDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, responseModel?: import("mongoose").Model<import("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema").ISurveyResponseDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema").ISurveyResponseDocument, {}, {}> & import("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema").ISurveyResponseDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, actionPlanModel?: import("mongoose").Model<import("../../../action-planning/infrastructure/persistence/mongoose/action-plan.schema").IActionPlanDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../../../action-planning/infrastructure/persistence/mongoose/action-plan.schema").IActionPlanDocument, {}, {}> & import("../../../action-planning/infrastructure/persistence/mongoose/action-plan.schema").IActionPlanDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>);
    execute(projectId: string): Promise<DashboardOverviewDto>;
}
