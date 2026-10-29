"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const audit_log_entity_1 = require("../../domain/entities/audit-log.entity");
const audit_log_schema_1 = require("../../infrastructure/persistence/mongoose/audit-log.schema");
class AuditLogService {
    static instance;
    isSubscribed = false;
    static getInstance() {
        if (!AuditLogService.instance) {
            AuditLogService.instance = new AuditLogService();
        }
        return AuditLogService.instance;
    }
    constructor() {
        this.initDomainEventListener();
    }
    initDomainEventListener() {
        if (this.isSubscribed)
            return;
        this.isSubscribed = true;
        event_bus_1.DomainEventBus.getInstance().subscribe('*', async (event) => {
            try {
                await this.handleDomainEvent(event);
            }
            catch (err) {
                console.error('[AuditLogService] Failed to record domain event:', err);
            }
        });
    }
    async recordAuditLog(props) {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return null;
            }
            const entity = new audit_log_entity_1.AuditLogEntity(props);
            const doc = new audit_log_schema_1.AuditLogModel({
                eventId: entity.eventId,
                projectId: entity.projectId,
                actorId: entity.actorId,
                actorRole: entity.actorRole,
                action: entity.action,
                resourceType: entity.resourceType,
                resourceId: entity.resourceId,
                metadata: entity.metadata,
                ipAddress: entity.ipAddress,
                timestamp: entity.timestamp,
            });
            return await doc.save();
        }
        catch (err) {
            console.error('[AuditLogService] Error recording audit log:', err);
            return null;
        }
    }
    async handleDomainEvent(event) {
        const eventType = event.eventType;
        let action = eventType;
        let resourceType = 'SYSTEM';
        const projectId = event.payload?.projectId || (event.aggregateId?.startsWith('PRJ-') ? event.aggregateId : null);
        if (!projectId) {
            console.warn(`[AuditLogService] Discarding event '${eventType}' without tenant project context`);
            return;
        }
        const actorId = event.payload?.actorId || event.payload?.authorId || 'SYSTEM';
        const actorRole = event.payload?.actorRole || 'PROJECT_ADMIN';
        if (eventType.includes('SURVEY_PUBLISHED')) {
            action = 'SURVEY_PUBLISHED';
            resourceType = 'SURVEY';
        }
        else if (eventType.includes('SURVEY_CREATED')) {
            action = 'SURVEY_DRAFT_CREATED';
            resourceType = 'SURVEY';
        }
        else if (eventType.includes('SURVEY_UPDATED')) {
            action = 'SURVEY_MODIFIED';
            resourceType = 'SURVEY';
        }
        else if (eventType.includes('SURVEY_CLONED')) {
            action = 'SURVEY_VERSION_CLONED';
            resourceType = 'SURVEY';
        }
        else if (eventType.includes('PROJECT_CREATED')) {
            action = 'PROJECT_CREATED';
            resourceType = 'PROJECT';
        }
        else if (eventType.includes('PROJECT_UPDATED')) {
            action = event.payload?.features ? 'FEATURE_FLAG_TOGGLED' : 'PROJECT_SETTINGS_UPDATED';
            resourceType = 'PROJECT';
        }
        else if (eventType.includes('EMPLOYEES_IMPORTED')) {
            action = 'HRIS_SYNC_COMPLETED';
            resourceType = 'EMPLOYEE';
        }
        else if (eventType.includes('EMPLOYEE_CREATED') || eventType.includes('EMPLOYEE_UPDATED') || eventType.includes('EMPLOYEE_TERMINATED')) {
            action = eventType;
            resourceType = 'EMPLOYEE';
        }
        else if (eventType.includes('KIOSK_PINS_GENERATED')) {
            action = 'KIOSK_PINS_GENERATED';
            resourceType = 'CAMPAIGN';
        }
        else if (eventType.includes('TOKEN_BURNED') || eventType.includes('RESPONSE_SUBMITTED')) {
            action = eventType.includes('TOKEN_BURNED') ? 'TOKEN_BURNED' : 'SURVEY_RESPONSE_INTAKE';
            resourceType = 'SURVEY';
        }
        else if (eventType.includes('REPORT_DOWNLOADED') || eventType.includes('REPORT_GENERATED')) {
            action = 'REPORT_DOWNLOADED';
            resourceType = 'REPORT';
        }
        else if (eventType.includes('ORG_NODE')) {
            action = eventType;
            resourceType = 'ORGANIZATION';
        }
        else if (eventType.includes('ACTION_PLAN')) {
            action = eventType;
            resourceType = 'ACTION_PLAN';
        }
        await this.recordAuditLog({
            eventId: event.eventId || crypto_1.default.randomUUID(),
            projectId,
            actorId,
            actorRole,
            action,
            resourceType,
            resourceId: event.aggregateId || event.payload?.surveyId || event.payload?.id || projectId || 'RES-SYSTEM',
            metadata: event.payload || {},
            ipAddress: '127.0.0.1',
            timestamp: event.timestamp || new Date(),
        });
    }
    async queryLogs(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        const skip = (page - 1) * limit;
        if (mongoose_1.default.connection?.readyState !== 1) {
            let filtered = params.projectId ? this.getFallbackSeedLogs(params.projectId) : [];
            if (params.action && params.action !== 'ALL') {
                filtered = filtered.filter(item => item.action === params.action);
            }
            if (params.resourceType && params.resourceType !== 'ALL') {
                filtered = filtered.filter(item => item.resourceType === params.resourceType);
            }
            if (params.actorId && params.actorId !== 'ALL') {
                filtered = filtered.filter(item => item.actorId.toLowerCase().includes(params.actorId.toLowerCase()));
            }
            if (params.search) {
                const q = params.search.toLowerCase();
                filtered = filtered.filter(item => item.action.toLowerCase().includes(q) ||
                    item.resourceType.toLowerCase().includes(q) ||
                    item.resourceId.toLowerCase().includes(q) ||
                    item.actorId.toLowerCase().includes(q));
            }
            return {
                total: filtered.length,
                page: 1,
                limit,
                totalPages: Math.ceil(filtered.length / limit) || 1,
                data: filtered.slice(skip, skip + limit),
            };
        }
        const filter = {};
        if (params.projectId && params.projectId !== 'ALL') {
            filter.projectId = params.projectId;
        }
        if (params.action && params.action !== 'ALL') {
            filter.action = params.action;
        }
        if (params.resourceType && params.resourceType !== 'ALL') {
            filter.resourceType = params.resourceType;
        }
        if (params.actorId && params.actorId !== 'ALL') {
            filter.actorId = { $regex: params.actorId, $options: 'i' };
        }
        if (params.search) {
            const searchRegex = { $regex: params.search, $options: 'i' };
            filter.$or = [
                { action: searchRegex },
                { resourceType: searchRegex },
                { resourceId: searchRegex },
                { actorId: searchRegex },
                { actorRole: searchRegex },
            ];
        }
        if (params.startDate || params.endDate) {
            filter.timestamp = {};
            if (params.startDate) {
                filter.timestamp.$gte = new Date(params.startDate);
            }
            if (params.endDate) {
                const end = new Date(params.endDate);
                end.setHours(23, 59, 59, 999);
                filter.timestamp.$lte = end;
            }
        }
        const [total, docs] = await Promise.all([
            audit_log_schema_1.AuditLogModel.countDocuments(filter),
            audit_log_schema_1.AuditLogModel.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);
        const data = docs.map((doc) => ({
            id: doc._id?.toString() || doc.eventId,
            eventId: doc.eventId,
            projectId: doc.projectId,
            actorId: doc.actorId,
            actorRole: doc.actorRole,
            action: doc.action,
            resourceType: doc.resourceType || (doc.resource?.includes(':') ? doc.resource.split(':')[0] : 'SYSTEM'),
            resourceId: doc.resourceId || (doc.resource?.includes(':') ? doc.resource.split(':').slice(1).join(':') : (doc.resource || 'RES-SYSTEM')),
            metadata: doc.metadata || doc.details || {},
            ipAddress: doc.ipAddress || '127.0.0.1',
            timestamp: doc.timestamp instanceof Date ? doc.timestamp.toISOString() : new Date(doc.timestamp).toISOString(),
        }));
        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            data,
        };
    }
    async seedDefaultsIfEmpty(projectId) {
        try {
            const count = await audit_log_schema_1.AuditLogModel.countDocuments({ projectId });
            if (count >= 5)
                return;
            const seeds = this.getFallbackSeedLogs(projectId);
            for (const item of seeds) {
                const exists = await audit_log_schema_1.AuditLogModel.findOne({ eventId: item.eventId });
                if (!exists) {
                    const { id: _ignored, ...docProps } = item;
                    await audit_log_schema_1.AuditLogModel.create({
                        ...docProps,
                        timestamp: new Date(item.timestamp),
                    });
                }
            }
        }
        catch (err) {
            console.error('[AuditLogService] Seed data check warning:', err);
        }
    }
    getFallbackSeedLogs(projectId) {
        const now = Date.now();
        return [
            {
                id: 'aud-001',
                eventId: 'evt-aud-001-' + projectId,
                projectId,
                actorId: 'USR-ADMIN',
                actorRole: 'SUPER_ADMIN',
                action: 'SURVEY_PUBLISHED',
                resourceType: 'SURVEY',
                resourceId: 'SRV-ENGAGEMENT-2026',
                metadata: {
                    surveyTitle: 'Annual Enterprise Pulse & Sentiment 2026',
                    version: '1.0.0',
                    localeCount: 3,
                    supportedLocales: ['en-US', 'si-LK', 'ta-LK'],
                    publishedBy: 'Kasun Wickramasinghe (Lead Consultant)',
                    hashChecksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                },
                ipAddress: '192.168.1.104',
                timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
            },
            {
                id: 'aud-002',
                eventId: 'evt-aud-002-' + projectId,
                projectId,
                actorId: 'USR-ADMIN',
                actorRole: 'PROJECT_ADMIN',
                action: 'FEATURE_FLAG_TOGGLED',
                resourceType: 'PROJECT',
                resourceId: projectId,
                metadata: {
                    updatedFlags: {
                        kioskPinDistribution: true,
                        differentialPrivacy: true,
                        hierarchicalReporting: true,
                        multiLocaleEnabled: true,
                    },
                    reason: 'Enterprise compliance activation for tea factory and manufacturing plants',
                },
                ipAddress: '192.168.1.104',
                timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
            },
            {
                id: 'aud-003',
                eventId: 'evt-aud-003-' + projectId,
                projectId,
                actorId: 'USR-CONSULTANT',
                actorRole: 'CONSULTANT_DAASH',
                action: 'KIOSK_PINS_GENERATED',
                resourceType: 'CAMPAIGN',
                resourceId: 'CMP-PLANT-001',
                metadata: {
                    campaignName: 'Frontline Tea Factory Shift Kiosk Survey',
                    batchSize: 50,
                    shift: 'Morning Shift A - Maskeliya Processing Plant',
                    vaultSaltRotationId: 'SALT-2026-OCT',
                },
                ipAddress: '203.115.24.12',
                timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
            },
            {
                id: 'aud-004',
                eventId: 'evt-aud-004-' + projectId,
                projectId,
                actorId: 'SYSTEM_DAEMON',
                actorRole: 'HRIS_CONNECTOR',
                action: 'HRIS_SYNC_COMPLETED',
                resourceType: 'EMPLOYEE',
                resourceId: 'BATCH-HRIS-SYNC-OCT',
                metadata: {
                    provider: 'SAP SuccessFactors / Workday HR API',
                    syncedRecords: 142,
                    addedCount: 8,
                    updatedCount: 134,
                    departmentsMapped: ['Engineering', 'Supply Chain', 'Field Operations', 'Finance'],
                    encryptionAlgorithm: 'AES-256-GCM',
                },
                ipAddress: '10.0.4.82',
                timestamp: new Date(now - 1000 * 60 * 360).toISOString(),
            },
            {
                id: 'aud-005',
                eventId: 'evt-aud-005-' + projectId,
                projectId,
                actorId: 'USR-EXEC-01',
                actorRole: 'REPORT_VIEWER',
                action: 'REPORT_DOWNLOADED',
                resourceType: 'REPORT',
                resourceId: 'REP-BOARD-Q3-2026',
                metadata: {
                    reportFormat: 'PDF',
                    differentialPrivacyApplied: true,
                    minimumCellSuppression: 5,
                    watermarkedUser: 'exec.director@aitkenspence.lk',
                    fileSizeKb: 2840,
                },
                ipAddress: '124.43.91.205',
                timestamp: new Date(now - 1000 * 60 * 720).toISOString(),
            },
            {
                id: 'aud-006',
                eventId: 'evt-aud-006-' + projectId,
                projectId,
                actorId: 'USR-SEC-OFFICER',
                actorRole: 'SUPER_ADMIN',
                action: 'SECURITY_POLICY_UPDATED',
                resourceType: 'PROJECT',
                resourceId: projectId,
                metadata: {
                    policy: 'ISO-27001-A.12.4-Logging-And-Monitoring',
                    retentionPeriodDays: 365,
                    anonymizationWindowMinutes: 0,
                    immutableStorageLocation: 's3://talnova-audit-vault-ap-southeast-1/',
                },
                ipAddress: '192.168.1.5',
                timestamp: new Date(now - 1000 * 60 * 1440).toISOString(),
            },
            {
                id: 'aud-007',
                eventId: 'evt-aud-007-' + projectId,
                projectId,
                actorId: 'USR-ADMIN',
                actorRole: 'PROJECT_ADMIN',
                action: 'SURVEY_DRAFT_CREATED',
                resourceType: 'SURVEY',
                resourceId: 'SRV-PULSE-2026-Q4',
                metadata: {
                    template: 'Frontline Worker Safety & Ergonomics Pulse',
                    questionCount: 12,
                    languages: ['en-US', 'si-LK'],
                },
                ipAddress: '192.168.1.104',
                timestamp: new Date(now - 1000 * 60 * 2880).toISOString(),
            },
        ];
    }
}
exports.AuditLogService = AuditLogService;
//# sourceMappingURL=audit-log.service.js.map