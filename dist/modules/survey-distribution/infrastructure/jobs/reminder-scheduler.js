"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderScheduler = void 0;
const campaign_schema_1 = require("../persistence/mongoose/campaign.schema");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const dispatch_reminders_use_case_1 = require("../../application/use-cases/dispatch-reminders.use-case");
const campaign_repository_1 = require("../persistence/mongoose/campaign.repository");
const token_vault_repository_1 = require("../persistence/mongoose/token-vault.repository");
const employee_repository_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.repository");
const mongoose_1 = __importDefault(require("mongoose"));
class ReminderScheduler {
    dispatchRemindersUseCase;
    static instance;
    intervalTimer = null;
    isRunning = false;
    constructor(dispatchRemindersUseCase) {
        this.dispatchRemindersUseCase = dispatchRemindersUseCase;
        if (!this.dispatchRemindersUseCase) {
            const cRepo = new campaign_repository_1.SurveyCampaignMongoRepository();
            const vRepo = new token_vault_repository_1.TokenVaultMongoRepository();
            const eRepo = new employee_repository_1.EmployeeMongoRepository();
            this.dispatchRemindersUseCase = new dispatch_reminders_use_case_1.DispatchRemindersUseCase(cRepo, vRepo, eRepo);
        }
    }
    static getInstance(useCase) {
        if (!ReminderScheduler.instance) {
            ReminderScheduler.instance = new ReminderScheduler(useCase);
        }
        return ReminderScheduler.instance;
    }
    start(intervalMs = 60 * 60 * 1000) {
        if (this.intervalTimer)
            return;
        // Trigger initial check non-blockingly
        this.checkAndDispatchReminders().catch((err) => console.error('[ReminderScheduler] Error during initial reminder check:', err));
        this.intervalTimer = setInterval(async () => {
            await this.checkAndDispatchReminders().catch((err) => console.error('[ReminderScheduler] Error during periodic reminder check:', err));
        }, intervalMs);
        if (this.intervalTimer.unref) {
            this.intervalTimer.unref();
        }
        console.log(`[ReminderScheduler] Automated reminder scheduler started (interval: ${intervalMs}ms)`);
    }
    stop() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
            console.log('[ReminderScheduler] Automated reminder scheduler stopped');
        }
    }
    isStarted() {
        return this.intervalTimer !== null;
    }
    async checkAndDispatchReminders() {
        if (this.isRunning)
            return 0;
        this.isRunning = true;
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return 0;
            }
            const now = new Date();
            const activeCampaigns = await campaign_schema_1.CampaignModel.find({
                status: campaign_entity_1.CampaignStatus.ACTIVE,
                isDeleted: false,
                startDate: { $lte: now },
                expirationDate: { $gt: now },
            });
            let dispatchedCount = 0;
            for (const campaign of activeCampaigns) {
                const schedule = campaign.schedule;
                if (!schedule)
                    continue;
                let shouldDispatch = false;
                // 1. Explicit scheduled reminder dates
                if (schedule.reminderDates && Array.isArray(schedule.reminderDates)) {
                    const hasMatchingDate = schedule.reminderDates.some((d) => {
                        const dateObj = new Date(d);
                        return (dateObj.getUTCFullYear() === now.getUTCFullYear() &&
                            dateObj.getUTCMonth() === now.getUTCMonth() &&
                            dateObj.getUTCDate() === now.getUTCDate());
                    });
                    if (hasMatchingDate)
                        shouldDispatch = true;
                }
                // 2. Frequency interval in days
                if (!shouldDispatch && schedule.reminderFrequencyDays && schedule.reminderFrequencyDays > 0) {
                    const daysSinceStart = Math.floor((now.getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceStart > 0 && daysSinceStart % schedule.reminderFrequencyDays === 0) {
                        shouldDispatch = true;
                    }
                }
                if (shouldDispatch && this.dispatchRemindersUseCase) {
                    try {
                        await this.dispatchRemindersUseCase.execute(campaign.projectId, campaign.campaignId);
                        dispatchedCount++;
                    }
                    catch (err) {
                        console.error(`[ReminderScheduler] Failed to dispatch reminders for campaign ${campaign.campaignId}:`, err);
                    }
                }
            }
            return dispatchedCount;
        }
        finally {
            this.isRunning = false;
        }
    }
}
exports.ReminderScheduler = ReminderScheduler;
//# sourceMappingURL=reminder-scheduler.js.map