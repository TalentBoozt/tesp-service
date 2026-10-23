export interface EmployeeSurveyHistoryItem {
    id: string;
    campaignId: string;
    title: string;
    status: 'COMPLETED' | 'PENDING';
    date: string;
    channel: string;
}
export declare class GetEmployeeSurveyHistoryUseCase {
    execute(projectId: string, employeeId: string): Promise<EmployeeSurveyHistoryItem[]>;
}
