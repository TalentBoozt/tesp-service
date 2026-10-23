"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchRemindersUseCase = void 0;
const notification_dispatcher_adapter_1 = require("../adapters/notification-dispatcher.adapter");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const survey_reminders_dispatched_event_1 = require("../../domain/events/survey-reminders-dispatched.event");
class DispatchRemindersUseCase {
    campaignRepo;
    vaultRepo;
    notificationDispatcher;
    constructor(campaignRepo, vaultRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
        this.notificationDispatcher = new notification_dispatcher_adapter_1.NotificationDispatcherAdapter();
    }
    async execute(projectId, campaignId) {
        const campaign = await this.campaignRepo.findByCampaignId(projectId, campaignId);
        if (!campaign) {
            throw new Error(`Campaign '${campaignId}' not found`);
        }
        if (campaign.status !== campaign_entity_1.CampaignStatus.ACTIVE) {
            throw new Error(`Cannot send reminders for campaign in status '${campaign.status}'`);
        }
        // Query Vault for tokens that remain unburned/uncompleted (FR-DST-005, TC-DST-002)
        const unburnedTokens = await this.vaultRepo.findUnburnedByCampaign(projectId, campaignId);
        const recipients = unburnedTokens.map((v) => ({
            email: v.employeeId ? `${v.employeeId}@company.com` : undefined,
            token: v.token,
            surveyUrl: `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/p?t=${v.token}`,
        }));
        if (recipients.length > 0) {
            await this.notificationDispatcher.dispatchReminders(projectId, campaignId, campaign.channels, recipients);
        }
        // Emit in-process domain event (PROMPT-08)
        new survey_reminders_dispatched_event_1.SurveyRemindersDispatchedEvent({
            projectId,
            campaignId,
            uncompletedCount: recipients.length,
        });
        return {
            campaignId,
            totalRemindersSent: recipients.length,
            uncompletedCount: recipients.length,
            dispatchedCount: recipients.length,
        };
    }
}
exports.DispatchRemindersUseCase = DispatchRemindersUseCase;
//# sourceMappingURL=dispatch-reminders.use-case.js.map