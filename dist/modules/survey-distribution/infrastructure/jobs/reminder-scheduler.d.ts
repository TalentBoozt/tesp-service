import { DispatchRemindersUseCase } from '../../application/use-cases/dispatch-reminders.use-case';
export declare class ReminderScheduler {
    private dispatchRemindersUseCase?;
    private static instance;
    private intervalTimer;
    private isRunning;
    constructor(dispatchRemindersUseCase?: DispatchRemindersUseCase | undefined);
    static getInstance(useCase?: DispatchRemindersUseCase): ReminderScheduler;
    start(intervalMs?: number): void;
    stop(): void;
    isStarted(): boolean;
    checkAndDispatchReminders(): Promise<number>;
}
