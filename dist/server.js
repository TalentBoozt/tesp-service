"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerInstance = getWorkerInstance;
exports.getReminderScheduler = getReminderScheduler;
exports.getMilestoneEscalationWorker = getMilestoneEscalationWorker;
exports.bootstrap = bootstrap;
exports.shutdown = shutdown;
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./shared/infrastructure/database/database");
const auth_seeder_service_1 = require("./modules/auth/infrastructure/services/auth-seeder.service");
const consulting_firm_seeder_service_1 = require("./modules/consultant/infrastructure/services/consulting-firm-seeder.service");
const survey_template_seeder_service_1 = require("./modules/survey/infrastructure/services/survey-template-seeder.service");
const report_job_worker_1 = require("./modules/reporting-engine/infrastructure/queue/report-job.worker");
const report_job_repository_1 = require("./modules/reporting-engine/infrastructure/persistence/mongoose/report-job.repository");
const report_job_queue_1 = require("./modules/reporting-engine/infrastructure/queue/report-job.queue");
const reminder_scheduler_1 = require("./modules/survey-distribution/infrastructure/jobs/reminder-scheduler");
const milestone_escalation_worker_1 = require("./modules/action-planning/application/services/milestone-escalation-worker");
let server = null;
let reportQueueTimer = null;
let reminderSchedulerInstance = null;
let workerInstance = null;
let milestoneEscalationWorkerInstance = null;
function getWorkerInstance() {
    return workerInstance;
}
function getReminderScheduler() {
    return reminderSchedulerInstance;
}
function getMilestoneEscalationWorker() {
    return milestoneEscalationWorkerInstance;
}
async function bootstrap() {
    try {
        // 0. Validate runtime environment variables
        (0, config_1.validateEnvironment)();
        console.log('[TESP Monolith] Runtime environment schema validated');
        // 1. Initialize MongoDB connection
        await database_1.Database.connect();
        console.log('[TESP Monolith] Connected to MongoDB Atlas');
        // 2. Ensure default production auth accounts exist
        const authSeeder = new auth_seeder_service_1.AuthSeederService();
        await authSeeder.ensureDefaultUsersExist();
        console.log('[TESP Monolith] Production IAM accounts verified in MongoDB');
        // 3. Ensure default consulting partner firms exist
        const firmSeeder = new consulting_firm_seeder_service_1.ConsultingFirmSeederService();
        await firmSeeder.ensureDefaultFirmsExist();
        console.log('[TESP Monolith] Consulting firms verified in MongoDB');
        // 3.1 Ensure default survey templates exist (including Employee Workplace & Culture Survey)
        const templateSeeder = new survey_template_seeder_service_1.SurveyTemplateSeederService();
        await templateSeeder.ensureDefaultTemplatesExist();
        console.log('[TESP Monolith] Survey templates verified in MongoDB');
        // 4. Initialize and drain persistent report job queue on boot (GAP-010 / TASK-03-03)
        const reportJobRepo = new report_job_repository_1.ReportJobMongoRepository();
        const reportQueue = report_job_queue_1.PersistentReportJobQueue.getInstance();
        workerInstance = report_job_worker_1.ReportJobWorker.getInstance(reportJobRepo, undefined, reportQueue);
        workerInstance.processQueue().catch((err) => {
            console.error('[TESP Monolith] Error draining report job queue on startup:', err);
        });
        console.log('[TESP Monolith] Report job worker initialized & startup queue drain triggered');
        // 5. Setup recurring queue drain interval (every 60s)
        reportQueueTimer = setInterval(async () => {
            if (workerInstance) {
                await workerInstance.processQueue().catch((err) => console.error('[TESP Monolith] Error in periodic queue drain:', err));
            }
        }, 60000);
        if (reportQueueTimer.unref)
            reportQueueTimer.unref();
        // 6. Initialize automated survey reminder scheduler (GAP-010 / TASK-03-03)
        reminderSchedulerInstance = reminder_scheduler_1.ReminderScheduler.getInstance();
        reminderSchedulerInstance.start();
        // 7. Initialize action planning milestone escalation worker (GAP-009 / TASK-011)
        milestoneEscalationWorkerInstance = milestone_escalation_worker_1.MilestoneEscalationWorker.getInstance();
        milestoneEscalationWorkerInstance.start();
        // 8. Start HTTP Server listener
        const app = (0, app_1.createApp)();
        server = app.listen(config_1.config.port, () => {
            console.log(`[TESP Monolith] Server listening on port ${config_1.config.port} (${config_1.config.nodeEnv})`);
        });
        return server;
    }
    catch (err) {
        console.error('[TESP Monolith] Fatal error during bootstrap:', err);
        process.exit(1);
    }
}
async function shutdown() {
    console.log('[TESP Monolith] Initiating graceful shutdown...');
    if (reportQueueTimer) {
        clearInterval(reportQueueTimer);
        reportQueueTimer = null;
    }
    if (reminderSchedulerInstance) {
        reminderSchedulerInstance.stop();
        reminderSchedulerInstance = null;
    }
    if (milestoneEscalationWorkerInstance) {
        milestoneEscalationWorkerInstance.stop();
        milestoneEscalationWorkerInstance = null;
    }
    if (server) {
        await new Promise((resolve) => {
            server.close(() => resolve());
        });
        server = null;
    }
    await database_1.Database.disconnect().catch(() => { });
    console.log('[TESP Monolith] Graceful shutdown complete');
}
// Graceful process termination handlers
process.on('SIGTERM', async () => {
    await shutdown();
    process.exit(0);
});
process.on('SIGINT', async () => {
    await shutdown();
    process.exit(0);
});
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}
//# sourceMappingURL=server.js.map