import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
export declare class MilestoneEscalationWorker {
    private static instance;
    private intervalTimer;
    private isRunning;
    private actionPlanRepo;
    private eventBus;
    constructor(actionPlanRepo?: IActionPlanRepository, eventBus?: IEventBus);
    static getInstance(actionPlanRepo?: IActionPlanRepository, eventBus?: IEventBus): MilestoneEscalationWorker;
    start(intervalMs?: number): void;
    stop(): void;
    isStarted(): boolean;
    processMilestoneDeadlines(referenceDate?: Date): Promise<{
        evaluatedPlans: number;
        nudgesEmitted: number;
        overdueEmitted: number;
    }>;
}
