"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchRemindersUseCase = void 0;
const notification_dispatcher_adapter_1 = require("../adapters/notification-dispatcher.adapter");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const survey_reminders_dispatched_event_1 = require("../../domain/events/survey-reminders-dispatched.event");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
class DispatchRemindersUseCase {
    campaignRepo;
    vaultRepo;
    notificationDispatcher;
    employeeRepo;
    eventBus;
    constructor(campaignRepo, vaultRepo, employeeRepoOrEventBus, eventBus) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
        if (employeeRepoOrEventBus &&
            'publish' in employeeRepoOrEventBus &&
            typeof employeeRepoOrEventBus.publish === 'function') {
            this.eventBus = employeeRepoOrEventBus;
            this.employeeRepo = undefined;
        }
        else {
            this.employeeRepo = employeeRepoOrEventBus;
            this.eventBus = eventBus || event_bus_1.DomainEventBus.getInstance();
        }
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
        // Look up genuine employee email addresses from employee repository (GAP-004)
        const validRecipients = [];
        for (const v of unburnedTokens) {
            let resolvedEmail = v.email;
            if (!resolvedEmail && v.employeeId && this.employeeRepo) {
                try {
                    const emp = await this.employeeRepo.findByEmployeeId(projectId, v.employeeId);
                    if (emp && emp.email) {
                        resolvedEmail = emp.email.trim();
                    }
                }
                catch {
                    // Failure handling: skip without crashing
                }
            }
            if (resolvedEmail) {
                validRecipients.push({
                    employeeId: v.employeeId,
                    email: resolvedEmail,
                    token: v.token,
                    surveyUrl: `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/p?t=${v.token}`,
                });
            }
            else {
                // Log note without exposing PII/email
                console.warn(`[DispatchReminders] Skipping reminder for token: no verified employee email found for recipient (employeeId: ${v.employeeId || 'ANONYMOUS'})`);
            }
        }
        if (validRecipients.length > 0) {
            await this.notificationDispatcher.dispatchReminders(projectId, campaignId, campaign.channels, validRecipients);
        }
        // Emit in-process domain event (PROMPT-08)
        const event = new survey_reminders_dispatched_event_1.SurveyRemindersDispatchedEvent({
            projectId,
            campaignId,
            uncompletedCount: unburnedTokens.length,
        });
        await this.eventBus.publish(event);
        return {
            campaignId,
            totalRemindersSent: validRecipients.length,
            uncompletedCount: unburnedTokens.length,
            dispatchedCount: validRecipients.length,
        };
    }
}
exports.DispatchRemindersUseCase = DispatchRemindersUseCase;
//# sourceMappingURL=dispatch-reminders.use-case.js.map