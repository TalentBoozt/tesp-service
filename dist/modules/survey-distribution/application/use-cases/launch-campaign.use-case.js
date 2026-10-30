"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchCampaignUseCase = exports.EmptyTargetAudienceError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const token_generator_service_1 = require("../../domain/services/token-generator.service");
const notification_dispatcher_adapter_1 = require("../adapters/notification-dispatcher.adapter");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const token_vault_entity_1 = require("../../domain/entities/token-vault.entity");
const campaign_launched_event_1 = require("../../domain/events/campaign-launched.event");
const org_node_repository_1 = require("../../../organization/infrastructure/persistence/mongoose/org-node.repository");
class EmptyTargetAudienceError extends Error {
    constructor(message = 'Cannot launch campaign: target organizational node contains 0 eligible active employees') {
        super(message);
        this.name = 'EmptyTargetAudienceError';
    }
}
exports.EmptyTargetAudienceError = EmptyTargetAudienceError;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
class LaunchCampaignUseCase {
    campaignRepo;
    vaultRepo;
    redisRepo;
    surveyRepo;
    employeeRepo;
    eventBus;
    orgNodeRepo;
    tokenGenerator;
    notificationDispatcher;
    constructor(campaignRepo, vaultRepo, redisRepo, surveyRepo, employeeRepo, eventBus = event_bus_1.DomainEventBus.getInstance(), orgNodeRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
        this.redisRepo = redisRepo;
        this.surveyRepo = surveyRepo;
        this.employeeRepo = employeeRepo;
        this.eventBus = eventBus;
        this.orgNodeRepo = orgNodeRepo;
        this.tokenGenerator = new token_generator_service_1.TokenGeneratorService();
        this.notificationDispatcher = new notification_dispatcher_adapter_1.NotificationDispatcherAdapter();
        if (!this.orgNodeRepo && mongoose_1.default.connection?.readyState === 1) {
            try {
                this.orgNodeRepo = new org_node_repository_1.OrgNodeMongoRepository();
            }
            catch {
                // Fallback for isolated unit tests without mongoose connection
            }
        }
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
        // 3. Resolve target audience employee records with materialized path & demographic expansion
        const targetEmployees = [];
        const seenEmployeeIds = new Set();
        if (this.employeeRepo) {
            const targetNodeIds = new Set();
            if (command.targetAudience?.nodeIds && command.targetAudience.nodeIds.length > 0) {
                for (const nodeId of command.targetAudience.nodeIds) {
                    targetNodeIds.add(nodeId);
                    if (this.orgNodeRepo) {
                        try {
                            const node = await this.orgNodeRepo.findByNodeId(command.projectId, nodeId);
                            if (node && node.path) {
                                const descendants = await this.orgNodeRepo.findSubTree(command.projectId, node.path);
                                for (const sub of descendants) {
                                    targetNodeIds.add(sub.nodeId);
                                }
                            }
                        }
                        catch {
                            // Fallback to direct nodeId if subtree resolution fails
                        }
                    }
                }
            }
            const demographicFilters = command.targetAudience?.demographicFilters;
            const evaluateDemographics = (emp) => {
                if (!demographicFilters || Object.keys(demographicFilters).length === 0) {
                    return true;
                }
                const attrs = emp.attributes || {};
                for (const [key, filterValue] of Object.entries(demographicFilters)) {
                    if (filterValue === undefined || filterValue === null || filterValue === '')
                        continue;
                    const actualValue = attrs[key] !== undefined ? attrs[key] : emp[key];
                    if (Array.isArray(filterValue)) {
                        if (!filterValue.includes(actualValue))
                            return false;
                    }
                    else if (typeof filterValue === 'object') {
                        if (filterValue.$eq !== undefined && actualValue !== filterValue.$eq)
                            return false;
                        if (filterValue.$in !== undefined && !filterValue.$in.includes(actualValue))
                            return false;
                    }
                    else {
                        if (String(actualValue).toLowerCase() !== String(filterValue).toLowerCase()) {
                            return false;
                        }
                    }
                }
                return true;
            };
            if (targetNodeIds.size > 0) {
                for (const nodeId of targetNodeIds) {
                    const result = await this.employeeRepo.findAll(command.projectId, { nodeId, limit: 50000 });
                    for (const e of result.employees) {
                        if (!seenEmployeeIds.has(e.employeeId) && evaluateDemographics(e)) {
                            seenEmployeeIds.add(e.employeeId);
                            targetEmployees.push({
                                employeeId: e.employeeId,
                                email: e.email,
                                phone: e.phoneNumber,
                                nodeId: e.nodeId,
                                matrixNodeIds: e.matrixNodeIds,
                            });
                        }
                    }
                }
            }
            else {
                const result = await this.employeeRepo.findAll(command.projectId, { limit: 50000 });
                for (const e of result.employees) {
                    if (!seenEmployeeIds.has(e.employeeId) && evaluateDemographics(e)) {
                        seenEmployeeIds.add(e.employeeId);
                        targetEmployees.push({
                            employeeId: e.employeeId,
                            email: e.email,
                            phone: e.phoneNumber,
                            nodeId: e.nodeId,
                            matrixNodeIds: e.matrixNodeIds,
                        });
                    }
                }
            }
        }
        // Fail-fast guard: If target audience contains 0 employees, reject launch without synthesizing fake audience (GAP-009)
        if (targetEmployees.length === 0) {
            const nodeInfo = command.targetAudience?.nodeIds?.join(', ') || 'unspecified';
            throw new EmptyTargetAudienceError(`Target audience is empty for node(s): ${nodeInfo}. Cannot launch campaign: target organizational node contains 0 eligible active employees.`);
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
                // Ground Worker without corporate email: Generate collision-free 6-digit PIN using CSPRNG (GAP-005)
                let pin = crypto_1.default.randomInt(100000, 1000000).toString();
                while (generatedPins.has(pin)) {
                    pin = crypto_1.default.randomInt(100000, 1000000).toString();
                }
                generatedPins.add(pin);
                token = pin;
                channel = 'PIN_KIOSK';
            }
            else {
                token = this.tokenGenerator.generateToken(command.anonymityLevel, command.campaignId, emp.employeeId);
                channel = 'EMAIL';
            }
            const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
            vaultEntities.push(new token_vault_entity_1.TokenVaultEntity({
                projectId: command.projectId,
                campaignId: command.campaignId,
                token,
                tokenHash,
                channel,
                employeeId: command.anonymityLevel === campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS ? undefined : emp.employeeId,
                nodeId: emp.nodeId,
                matrixNodeIds: emp.matrixNodeIds || [],
                expiresAt: command.expirationDate,
            }));
            const payload = {
                projectId: command.projectId,
                campaignId: command.campaignId,
                surveyId: command.surveyId,
                surveyVersion: command.surveyVersion,
                anonymityLevel: command.anonymityLevel,
                nodeId: emp.nodeId,
                matrixNodeIds: emp.matrixNodeIds || [],
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
            campaign.metrics.delivered = 0;
            campaign.metrics.bounced = 0;
        }
        // 9. Save and return Campaign
        const savedCampaign = await this.campaignRepo.save(campaign);
        // Publish In-Process Domain Event (FR-DST-006)
        const event = new campaign_launched_event_1.CampaignLaunchedEvent({
            projectId: command.projectId,
            campaignId: command.campaignId,
            surveyId: command.surveyId,
            surveyVersion: command.surveyVersion,
            totalTargeted: targetEmployees.length,
            anonymityLevel: command.anonymityLevel,
        });
        await this.eventBus.publish(event);
        return savedCampaign;
    }
}
exports.LaunchCampaignUseCase = LaunchCampaignUseCase;
//# sourceMappingURL=launch-campaign.use-case.js.map