import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { IActionTemplateRepository } from '../../domain/repositories/action-template.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { AnalyticalSnapshotCreatedEvent } from '../../../analytics-engine/domain/events/analytical-snapshot-created.event';
export declare class AnalyticsThresholdSubscriber {
    private actionPlanRepo;
    private templateRepo?;
    private eventBus;
    private static instance?;
    private isSubscribed;
    private defaultThreshold;
    constructor(actionPlanRepo?: IActionPlanRepository, templateRepo?: IActionTemplateRepository | undefined, eventBus?: IEventBus, defaultThreshold?: number);
    static getInstance(actionPlanRepo?: IActionPlanRepository, templateRepo?: IActionTemplateRepository, eventBus?: IEventBus): AnalyticsThresholdSubscriber;
    init(): void;
    handle(event: AnalyticalSnapshotCreatedEvent): Promise<ActionPlanEntity[]>;
    private triggerPlanForNode;
}
