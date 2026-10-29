import { ReportJobWorker } from './modules/reporting-engine/infrastructure/queue/report-job.worker';
import { ReminderScheduler } from './modules/survey-distribution/infrastructure/jobs/reminder-scheduler';
import { MilestoneEscalationWorker } from './modules/action-planning/application/services/milestone-escalation-worker';
import { Server } from 'http';
export declare function getWorkerInstance(): ReportJobWorker | null;
export declare function getReminderScheduler(): ReminderScheduler | null;
export declare function getMilestoneEscalationWorker(): MilestoneEscalationWorker | null;
export declare function bootstrap(): Promise<Server>;
export declare function shutdown(): Promise<void>;
