import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { WorkplaceRiskAlertEvent } from '../../../ai-analytics/domain/events/workplace-risk-alert.event';
export declare class WorkplaceRiskSubscriber {
    private actionPlanRepo;
    private eventBus;
    private static instance?;
    private isSubscribed;
    constructor(actionPlanRepo?: IActionPlanRepository, eventBus?: IEventBus);
    static getInstance(actionPlanRepo?: IActionPlanRepository, eventBus?: IEventBus): WorkplaceRiskSubscriber;
    init(): void;
    handle(event: WorkplaceRiskAlertEvent): Promise<ActionPlanEntity | null>;
}
