import { Document } from 'mongoose';
import { ActionPlanStatus, MilestoneStatus } from '../../../domain/entities/action-plan.entity';
export interface IActionPlanDocument extends Document {
    projectId: string;
    actionPlanId: string;
    campaignId: string;
    nodeId: string;
    groupId: string;
    title: string;
    description?: string;
    status: ActionPlanStatus;
    assigneeId: string;
    approverId?: string;
    baselineScore: number;
    targetScore: number;
    postActionScore?: number;
    targetCompletionDate: Date;
    milestones: {
        milestoneId: string;
        title: string;
        status: MilestoneStatus;
        dueDate: Date;
        completed?: boolean;
        alertState?: 'NONE' | 'NUDGE_SENT' | 'OVERDUE_ESCALATED';
    }[];
    externalSync?: {
        system: 'NONE' | 'JIRA' | 'MS_PLANNER';
        externalKey?: string;
        externalTaskId?: string;
        externalUrl?: string;
        status?: 'SYNCED' | 'PENDING_CONFIG';
        lastSyncedAt?: Date;
    };
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ActionPlanModel: import("mongoose").Model<IActionPlanDocument, {}, {}, {}, Document<unknown, {}, IActionPlanDocument, {}, {}> & IActionPlanDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
