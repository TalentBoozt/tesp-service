"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationDistributionEngine = exports.NotificationDistributionEngine = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const notification_service_1 = require("./notification.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class NotificationDistributionEngine {
    service;
    eventBus;
    static instance;
    isStarted = false;
    processedEventIds = new Set();
    MAX_TRACKED_EVENTS = 5000;
    constructor(service = notification_service_1.notificationService, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.service = service;
        this.eventBus = eventBus;
    }
    static getInstance() {
        if (!NotificationDistributionEngine.instance) {
            NotificationDistributionEngine.instance = new NotificationDistributionEngine();
        }
        return NotificationDistributionEngine.instance;
    }
    static resetInstance() {
        NotificationDistributionEngine.instance = undefined;
    }
    /**
     * Idempotently starts event subscribers for real-time notification distribution.
     */
    start() {
        if (this.isStarted)
            return;
        this.isStarted = true;
        // 1. Tenant Provisioning
        this.eventBus.subscribe('TENANT_PROJECT_PROVISIONED', async (event) => {
            await this.onTenantProjectProvisioned(event);
        });
        // 2. Organization Unit Created
        this.eventBus.subscribe('ORG_NODE_CREATED', async (event) => {
            await this.onOrgNodeCreated(event);
        });
        // 3. Survey Response Submission & Quorum / Anonymity Intake
        this.eventBus.subscribe('SURVEY_RESPONSE_SUBMITTED', async (event) => {
            await this.onSurveyResponseSubmitted(event);
        });
        // 4. Campaign Launch
        this.eventBus.subscribe('CAMPAIGN_LAUNCHED', async (event) => {
            await this.onCampaignLaunched(event);
        });
        // 5. Survey Instrument Publication
        this.eventBus.subscribe('SURVEY_PUBLISHED', async (event) => {
            await this.onSurveyPublished(event);
        });
        // 6. Report Generated
        this.eventBus.subscribe('REPORT_GENERATED', async (event) => {
            await this.onReportGenerated(event);
        });
        // 7. Workplace Risk Alert
        this.eventBus.subscribe('WORKPLACE_RISK_ALERT', async (event) => {
            await this.onWorkplaceRiskAlert(event);
        });
        console.log('[NotificationDistributionEngine] Initialized event subscribers successfully.');
    }
    isDuplicate(eventId) {
        if (!eventId)
            return false;
        if (this.processedEventIds.has(eventId))
            return true;
        if (this.processedEventIds.size >= this.MAX_TRACKED_EVENTS) {
            const firstEntries = Array.from(this.processedEventIds).slice(0, 1000);
            for (const id of firstEntries)
                this.processedEventIds.delete(id);
        }
        this.processedEventIds.add(eventId);
        return false;
    }
    // --- Handlers ---
    async onTenantProjectProvisioned(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId || event.aggregateId;
            const name = payload.name || payload.tenantName || projectId;
            const tier = payload.tier || 'ENTERPRISE';
            const clientName = payload.clientName;
            await this.service.notifyTenantProvisioned(projectId, name, clientName, tier);
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process TENANT_PROJECT_PROVISIONED:', err);
        }
    }
    async onOrgNodeCreated(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const name = payload.name || payload.nodeName || 'Organizational Unit';
            const nodeType = payload.type || payload.nodeType || 'DEPARTMENT';
            const parentNodeId = payload.parentId || payload.parentNodeId;
            if (projectId) {
                await this.service.notifyOrgNodeCreated(projectId, name, nodeType, parentNodeId);
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process ORG_NODE_CREATED:', err);
        }
    }
    async onSurveyResponseSubmitted(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const surveyId = payload.surveyId;
            const campaignId = payload.campaignId;
            if (!projectId || !surveyId)
                return;
            let respondentCount = undefined;
            let targetCount = undefined;
            let campaignTitle = campaignId;
            if (mongoose_1.default.connection?.readyState === 1) {
                try {
                    const { SurveyResponseModel } = await Promise.resolve().then(() => __importStar(require('../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema')));
                    respondentCount = await SurveyResponseModel.countDocuments({
                        projectId,
                        surveyId,
                        ...(campaignId ? { campaignId } : {}),
                        status: { $in: ['ACCEPTED', 'VALIDATED', 'SUBMITTED'] },
                    });
                    if (campaignId) {
                        const { CampaignModel } = await Promise.resolve().then(() => __importStar(require('../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema')));
                        const campaign = await CampaignModel.findOne({ projectId, campaignId }).lean();
                        if (campaign) {
                            campaignTitle = campaign.title || campaignId;
                            targetCount = campaign.targetEmployeeIds?.length || campaign.totalTargeted || 0;
                        }
                    }
                }
                catch {
                    // Non-blocking query failure
                }
            }
            await this.service.notifySurveyResponseSubmitted(projectId, surveyId, campaignId, respondentCount);
            // Evaluate Differential Privacy Threshold (N = 5)
            if (respondentCount === 5) {
                await this.service.createNotification({
                    projectId,
                    recipientRole: auth_middleware_1.UserRole.ORG_ADMIN,
                    category: 'COMPLIANCE',
                    severity: 'SUCCESS',
                    title: 'Differential Privacy Clearance Reached (N >= 5)',
                    message: `Campaign "${campaignTitle || campaignId}" has reached 5 validated responses. Reporting aggregations for this cohort now satisfy differential privacy anonymity floors.`,
                    actionUrl: '/campaigns',
                    metadata: { surveyId, campaignId, respondentCount: 5 },
                });
            }
            // Evaluate Campaign Quorum Milestones (25%, 50%, 75%, 100%)
            if (respondentCount && targetCount && targetCount > 0) {
                const rate = Math.floor((respondentCount / targetCount) * 100);
                const milestoneThresholds = [25, 50, 75, 100];
                for (const m of milestoneThresholds) {
                    const prevRate = Math.floor(((respondentCount - 1) / targetCount) * 100);
                    if (prevRate < m && rate >= m) {
                        await this.service.notifyCampaignMilestone(projectId, campaignTitle || campaignId, m, '/campaigns');
                    }
                }
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process SURVEY_RESPONSE_SUBMITTED:', err);
        }
    }
    async onCampaignLaunched(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const campaignId = payload.campaignId;
            const totalTargeted = payload.totalTargeted;
            let campaignTitle = campaignId;
            if (mongoose_1.default.connection?.readyState === 1 && projectId && campaignId) {
                try {
                    const { CampaignModel } = await Promise.resolve().then(() => __importStar(require('../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema')));
                    const camp = await CampaignModel.findOne({ projectId, campaignId }).lean();
                    if (camp?.title)
                        campaignTitle = camp.title;
                }
                catch { }
            }
            if (projectId && campaignId) {
                await this.service.notifyCampaignLaunched(projectId, campaignId, campaignTitle, totalTargeted);
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process CAMPAIGN_LAUNCHED:', err);
        }
    }
    async onSurveyPublished(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const surveyId = payload.surveyId || event.aggregateId;
            const version = payload.version || 1;
            let surveyTitle = surveyId;
            if (mongoose_1.default.connection?.readyState === 1 && projectId && surveyId) {
                try {
                    const { SurveyModel } = await Promise.resolve().then(() => __importStar(require('../../../survey/infrastructure/persistence/mongoose/survey.schema')));
                    const s = await SurveyModel.findOne({ projectId, surveyId }).lean();
                    if (s?.title)
                        surveyTitle = s.title;
                }
                catch { }
            }
            if (projectId && surveyId) {
                await this.service.notifySurveyPublished(projectId, surveyId, surveyTitle, version);
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process SURVEY_PUBLISHED:', err);
        }
    }
    async onReportGenerated(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const downloadUrl = payload.downloadUrl || '/reports';
            const reportType = payload.reportType || 'EXECUTIVE_SUMMARY';
            const title = `${reportType} Report`;
            if (projectId) {
                await this.service.notifyReportReady(projectId, 'ADMIN', title, downloadUrl);
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process REPORT_GENERATED:', err);
        }
    }
    async onWorkplaceRiskAlert(event) {
        if (this.isDuplicate(event.eventId))
            return;
        try {
            const payload = event.payload || {};
            const projectId = payload.projectId;
            const category = payload.category || 'WORKPLACE_RISK';
            const severity = payload.severity || 'CRITICAL';
            if (projectId) {
                await this.service.createNotification({
                    projectId,
                    recipientRole: auth_middleware_1.UserRole.ORG_ADMIN,
                    category: 'COMPLIANCE',
                    severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                    title: `Workplace Risk Flagged: ${category}`,
                    message: `Automated sentiment & risk scanner flagged a ${severity.toLowerCase()} risk indicator in survey responses. Immediate administrative review recommended.`,
                    actionUrl: '/ai-analytics',
                    metadata: { category, severity },
                });
            }
        }
        catch (err) {
            console.warn('[NotificationDistributionEngine] Failed to process WORKPLACE_RISK_ALERT:', err);
        }
    }
}
exports.NotificationDistributionEngine = NotificationDistributionEngine;
exports.notificationDistributionEngine = NotificationDistributionEngine.getInstance();
//# sourceMappingURL=notification-distribution-engine.js.map