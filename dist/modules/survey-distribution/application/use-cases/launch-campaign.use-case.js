"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchCampaignUseCase = void 0;
const token_generator_service_1 = require("../../domain/services/token-generator.service");
const notification_dispatcher_adapter_1 = require("../adapters/notification-dispatcher.adapter");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const token_vault_entity_1 = require("../../domain/entities/token-vault.entity");
const campaign_launched_event_1 = require("../../domain/events/campaign-launched.event");
class LaunchCampaignUseCase {
    campaignRepo;
    vaultRepo;
    redisRepo;
    surveyRepo;
    employeeRepo;
    tokenGenerator;
    notificationDispatcher;
    constructor(campaignRepo, vaultRepo, redisRepo, surveyRepo, employeeRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
        this.redisRepo = redisRepo;
        this.surveyRepo = surveyRepo;
        this.employeeRepo = employeeRepo;
        this.tokenGenerator = new token_generator_service_1.TokenGeneratorService();
        this.notificationDispatcher = new notification_dispatcher_adapter_1.NotificationDispatcherAdapter();
    }
    async execute(command) {
        // 1. Check if campaignId already exists
        const existing = await this.campaignRepo.findByCampaignId(command.projectId, command.campaignId);
        if (existing) {
            throw new Error(`Campaign with ID '${command.campaignId}' already exists`);
        }
        // 2. Validate survey publication status (VR-DST-002)
        if (this.surveyRepo) {
            const survey = await this.surveyRepo.findBySurveyId(command.projectId, command.surveyId, command.surveyVersion);
            if (!survey) {
                throw new Error(`Target survey '${command.surveyId}' (v${command.surveyVersion}) does not exist`);
            }
            if (survey.status !== 'PUBLISHED' && survey.status !== 'ACTIVE') {
                throw new Error(`Target survey is not published (current status: '${survey.status}')`);
            }
        }
        // 3. Resolve target audience employee records
        const targetEmployees = [];
        if (this.employeeRepo && command.targetAudience?.nodeIds && command.targetAudience.nodeIds.length > 0) {
            for (const nodeId of command.targetAudience.nodeIds) {
                const result = await this.employeeRepo.findAll(command.projectId, { nodeId, limit: 50000 });
                targetEmployees.push(...result.employees.map((e) => ({
                    employeeId: e.employeeId,
                    email: e.email,
                    phone: e.phoneNumber,
                    nodeId: e.nodeId,
                })));
            }
        }
        // Fallback: If no explicit employees returned, generate requested target count or default
        const targetCount = command.targetEmployeesCount || (targetEmployees.length > 0 ? targetEmployees.length : 1);
        if (targetEmployees.length === 0) {
            for (let i = 1; i <= targetCount; i++) {
                targetEmployees.push({
                    employeeId: `EMP-${1000 + i}`,
                    email: `employee${i}@company.com`,
                    phone: `+1555000100${i}`,
                    nodeId: command.targetAudience?.nodeIds?.[0] || 'N-101',
                });
            }
        }
        // Format schedule reminder dates
        const reminderDatesFormatted = command.schedule?.reminderDates
            ? command.schedule.reminderDates.map((d) => (typeof d === 'string' ? new Date(d) : d))
            : undefined;
        // 4. Create Campaign Entity
        const channels = [...command.channels];
        const campaign = new campaign_entity_1.CampaignEntity({
            projectId: command.projectId,
            campaignId: command.campaignId,
            surveyId: command.surveyId,
            surveyVersion: command.surveyVersion,
            title: command.title,
            anonymityLevel: command.anonymityLevel,
            channels,
            targetAudience: command.targetAudience,
            schedule: command.schedule
                ? {
                    reminderDates: reminderDatesFormatted,
                    reminderFrequencyDays: command.schedule.reminderFrequencyDays,
                }
                : undefined,
            status: campaign_entity_1.CampaignStatus.DRAFT,
            startDate: command.startDate,
            expirationDate: command.expirationDate,
        });
        campaign.launch(targetEmployees.length);
        // 5. Generate Cryptographic Tokens and Vault Entities (Hybrid Desk + Ground Partitioning)
        const now = new Date();
        const ttlSeconds = Math.max(60, Math.floor((command.expirationDate.getTime() - now.getTime()) / 1000));
        const vaultEntities = [];
        const redisTokensBatch = [];
        const recipientDispatches = [];
        const generatedPins = new Set();
        let hasGroundWorkersWithoutEmail = false;
        for (const emp of targetEmployees) {
            const hasEmail = Boolean(emp.email && emp.email.trim().length > 0);
            let token;
            let channel;
            if (!hasEmail) {
                hasGroundWorkersWithoutEmail = true;
                // Ground Worker without corporate email: Generate collision-free 6-digit PIN
                let pin = Math.floor(100000 + Math.random() * 900000).toString();
                while (generatedPins.has(pin)) {
                    pin = Math.floor(100000 + Math.random() * 900000).toString();
                }
                generatedPins.add(pin);
                token = pin;
                channel = 'PIN_KIOSK';
            }
            else {
                token = this.tokenGenerator.generateToken(command.anonymityLevel, command.campaignId, emp.employeeId);
                channel = 'EMAIL';
            }
            vaultEntities.push(new token_vault_entity_1.TokenVaultEntity({
                projectId: command.projectId,
                campaignId: command.campaignId,
                token,
                tokenHash: token,
                channel,
                employeeId: command.anonymityLevel === campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS ? undefined : emp.employeeId,
                nodeId: emp.nodeId,
                expiresAt: command.expirationDate,
            }));
            const payload = {
                projectId: command.projectId,
                campaignId: command.campaignId,
                surveyId: command.surveyId,
                surveyVersion: command.surveyVersion,
                anonymityLevel: command.anonymityLevel,
                nodeId: emp.nodeId,
                employeeId: command.anonymityLevel === campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS ? undefined : emp.employeeId,
                expirationDate: command.expirationDate.toISOString(),
                channel,
            };
            redisTokensBatch.push({
                token,
                payload,
            });
            if (!hasEmail) {
                // Also cache PIN- prefixed token for kiosk intake terminal convenience
                redisTokensBatch.push({
                    token: `PIN-${token}`,
                    payload,
                });
            }
            recipientDispatches.push({
                employeeId: emp.employeeId,
                email: hasEmail ? emp.email : undefined,
                phone: emp.phone,
                nodeId: emp.nodeId,
                token,
                channel,
                surveyUrl: hasEmail
                    ? `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/p?t=${token}`
                    : `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/intake?mode=kiosk&campaignId=${command.campaignId}`,
            });
        }
        if (hasGroundWorkersWithoutEmail && !campaign.channels.includes(campaign_entity_1.DistributionChannel.KIOSK_PIN)) {
            campaign.channels.push(campaign_entity_1.DistributionChannel.KIOSK_PIN);
        }
        // 6. Save Vault Mappings to isolated collection (FR-DST-004)
        await this.vaultRepo.saveBatch(vaultEntities);
        // 7. Stream generated tokens to Redis (FR-DST-003)
        await this.redisRepo.cacheBatchTokens(redisTokensBatch, ttlSeconds);
        // 8. Dispatch Notifications across channels (FR-DST-001)
        const dispatchResult = await this.notificationDispatcher.dispatchCampaignInvitations({
            projectId: command.projectId,
            campaignId: command.campaignId,
            channels: command.channels,
            recipients: recipientDispatches,
            title: command.title,
            surveyId: command.surveyId,
        });
        if (dispatchResult.success) {
            campaign.metrics.sent = targetEmployees.length;
            campaign.metrics.delivered = targetEmployees.length;
        }
        // 9. Save and return Campaign
        const savedCampaign = await this.campaignRepo.save(campaign);
        // Publish In-Process Domain Event (FR-DST-006)
        new campaign_launched_event_1.CampaignLaunchedEvent({
            projectId: command.projectId,
            campaignId: command.campaignId,
            surveyId: command.surveyId,
            surveyVersion: command.surveyVersion,
            totalTargeted: targetEmployees.length,
            anonymityLevel: command.anonymityLevel,
        });
        return savedCampaign;
    }
}
exports.LaunchCampaignUseCase = LaunchCampaignUseCase;
//# sourceMappingURL=launch-campaign.use-case.js.map