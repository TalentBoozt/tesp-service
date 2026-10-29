export type ActionPlanStatus = 'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type MilestoneAlertState = 'NONE' | 'NUDGE_SENT' | 'OVERDUE_ESCALATED';
export interface Milestone {
    milestoneId: string;
    title: string;
    status: MilestoneStatus;
    dueDate: Date;
    completed?: boolean;
    alertState?: MilestoneAlertState;
}
export interface ExternalSync {
    system: 'NONE' | 'JIRA' | 'MS_PLANNER';
    externalKey?: string;
    externalTaskId?: string;
    externalUrl?: string;
    status?: 'SYNCED' | 'PENDING_CONFIG';
    lastSyncedAt?: Date;
}
export interface ActionPlanProps {
    projectId: string;
    actionPlanId: string;
    campaignId: string;
    nodeId: string;
    groupId: string;
    title: string;
    description?: string;
    status?: ActionPlanStatus;
    assigneeId: string;
    approverId?: string;
    baselineScore: number;
    targetScore: number;
    postActionScore?: number;
    targetCompletionDate: Date;
    milestones?: Milestone[];
    externalSync?: ExternalSync;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ActionPlanEntity {
    readonly projectId: string;
    readonly actionPlanId: string;
    readonly campaignId: string;
    readonly nodeId: string;
    readonly groupId: string;
    readonly title: string;
    readonly description?: string;
    status: ActionPlanStatus;
    readonly assigneeId: string;
    approverId?: string;
    readonly baselineScore: number;
    readonly targetScore: number;
    postActionScore?: number;
    readonly targetCompletionDate: Date;
    milestones: Milestone[];
    externalSync: ExternalSync;
    readonly isDeleted: boolean;
    readonly createdAt: Date;
    updatedAt: Date;
    constructor(props: ActionPlanProps);
    private validateActionPlanId;
    toJSON(): ActionPlanProps;
}
