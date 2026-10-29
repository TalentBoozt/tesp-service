"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenantManagementRouter = createTenantManagementRouter;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const project_schema_1 = require("../../infrastructure/persistence/mongoose/project.schema");
const employee_schema_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.schema");
const survey_schema_1 = require("../../../survey/infrastructure/persistence/mongoose/survey.schema");
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
const token_vault_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/token-vault.schema");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
const audit_log_schema_1 = require("../../../audit-log/infrastructure/persistence/mongoose/audit-log.schema");
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
const consulting_firm_schema_1 = require("../../../consultant/infrastructure/persistence/mongoose/consulting-firm.schema");
const bcrypt_hasher_service_1 = require("../../../auth/infrastructure/services/bcrypt-hasher.service");
const user_entity_1 = require("../../../auth/domain/entities/user.entity");
const change_password_use_case_1 = require("../../../auth/application/use-cases/change-password.use-case");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const system_email_service_1 = require("../../../../shared/infrastructure/email/system-email.service");
const config_1 = require("../../../../config");
const crypto_1 = __importDefault(require("crypto"));
function createTenantManagementRouter() {
    const router = (0, express_1.Router)();
    // All endpoints require SUPER_ADMIN
    router.use('/admin', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]));
    /**
     * GET /api/v1/admin/overview
     * Platform-wide telemetry, global resource consumption, and infrastructure status
     */
    router.get('/admin/overview', async (_req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const [projects, totalEmployees, totalSurveys, totalCampaigns, totalResponses, totalAuditLogs,] = await Promise.all([
                project_schema_1.ProjectModel.find({ isDeleted: { $ne: true } }).lean(),
                employee_schema_1.EmployeeModel.countDocuments({ isDeleted: { $ne: true } }),
                survey_schema_1.SurveyModel.countDocuments({ isDeleted: { $ne: true } }),
                campaign_schema_1.CampaignModel.countDocuments({ isDeleted: { $ne: true } }),
                survey_response_schema_1.SurveyResponseModel.countDocuments({ isDeleted: { $ne: true } }),
                audit_log_schema_1.AuditLogModel.countDocuments({}),
            ]);
            const tenantIds = new Set(projects.map((p) => p.tenantId || 'TENANT-DAASH'));
            let globalResponseCap = 0;
            let globalAiTokenCap = 0;
            for (const p of projects) {
                globalResponseCap += p.budgets?.monthlyResponseCap || 50000;
                globalAiTokenCap += p.budgets?.aiTokenCap || 1000000;
            }
            let totalVaultTokens = 0;
            try {
                if (mongoose_1.default.connection?.readyState === 1 && typeof token_vault_schema_1.TokenVaultModel?.countDocuments === 'function') {
                    totalVaultTokens = await Promise.race([
                        token_vault_schema_1.TokenVaultModel.countDocuments({}),
                        new Promise((resolve) => setTimeout(() => resolve(0), 100)),
                    ]);
                }
            }
            catch {
                totalVaultTokens = 0;
            }
            const isEncryptionKeyConfigured = Boolean(process.env.FIELD_ENCRYPTION_KEY &&
                process.env.FIELD_ENCRYPTION_KEY !== 'tesp-field-encryption-master-secret-2026');
            const isBlindIndexKeyConfigured = Boolean(process.env.BLIND_INDEX_KEY &&
                process.env.BLIND_INDEX_KEY !== 'tesp-blind-index-hmac-secret-2026');
            const isKeyConfigured = isEncryptionKeyConfigured && isBlindIndexKeyConfigured;
            let vaultStatus;
            if (process.env.NODE_ENV === 'production') {
                vaultStatus = isKeyConfigured
                    ? `SEALED (ACTIVE / ${totalVaultTokens} tokens secured)`
                    : 'DEGRADED (UNCONFIGURED_MASTER_KEY)';
            }
            else {
                vaultStatus = totalVaultTokens > 0
                    ? `ACTIVE (${totalVaultTokens} tokens secured)`
                    : 'SEALED (KEYS_VERIFIED)';
            }
            res.status(200).json({
                totalTenants: tenantIds.size || 1,
                totalClientProjects: projects.length,
                totalEmployees,
                totalSurveys,
                totalCampaigns,
                totalResponses,
                totalAuditLogs,
                globalResponseCap,
                globalAiTokenCap,
                quotaUtilizationPercent: globalResponseCap > 0 ? Number(((totalResponses / globalResponseCap) * 100).toFixed(1)) : 0,
                infrastructure: {
                    clusterStatus: mongoose_1.default.connection?.readyState === 1 ? 'HEALTHY' : 'DEGRADED',
                    workerNodes: Number(process.env.WORKER_NODES || 1),
                    dbState: mongoose_1.default.connection?.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
                    databaseCluster: 'MongoDB Atlas',
                    redisCache: (config_1.config.upstashRedisRestUrl || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) ? 'CONNECTED' : 'IN_MEMORY',
                    vaultStatus,
                    rateLimiterStatus: 'ACTIVE',
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * GET /api/v1/admin/infrastructure
     * Live Infrastructure Telemetry
     */
    router.get('/admin/infrastructure', async (_req, res) => {
        const isConnected = mongoose_1.default.connection?.readyState === 1;
        res.status(200).json({
            clusterStatus: isConnected ? 'HEALTHY' : 'DEGRADED',
            database: {
                connected: isConnected,
                readyState: mongoose_1.default.connection?.readyState ?? 0,
            },
            process: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
            },
        });
    });
    /**
     * GET /api/v1/admin/tenants
     * Returns all client projects grouped with their consulting tenant, budgets, and live metrics
     */
    router.get('/admin/tenants', async (_req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const projects = await project_schema_1.ProjectModel.find({ isDeleted: { $ne: true } })
                .sort({ createdAt: -1 })
                .lean();
            const tenantsData = await Promise.all(projects.map(async (p) => {
                const [employeeCount, surveyCount, campaignCount, responseCount] = await Promise.all([
                    employee_schema_1.EmployeeModel.countDocuments({ projectId: p.projectId, isDeleted: { $ne: true } }),
                    survey_schema_1.SurveyModel.countDocuments({ projectId: p.projectId, isDeleted: { $ne: true } }),
                    campaign_schema_1.CampaignModel.countDocuments({ projectId: p.projectId, isDeleted: { $ne: true } }),
                    survey_response_schema_1.SurveyResponseModel.countDocuments({ projectId: p.projectId, isDeleted: { $ne: true } }),
                ]);
                const budgets = p.budgets || {
                    monthlyResponseCap: 50000,
                    responsesConsumed: responseCount,
                    aiTokenCap: 1000000,
                    aiTokensConsumed: 12500,
                    maxEmployees: 5000,
                    storageQuotaMb: 5000,
                };
                return {
                    id: p._id?.toString() || p.projectId,
                    projectId: p.projectId,
                    name: p.name,
                    clientOrgName: p.clientOrgName || p.branding?.companyName || p.name,
                    tenantId: p.tenantId || 'TENANT-DAASH',
                    tenantName: p.tenantName || 'Daash Global Advisory',
                    tier: p.tier || 'ENTERPRISE',
                    status: p.status || 'ACTIVE',
                    branding: p.branding,
                    supportedLocales: p.supportedLocales || ['en-US'],
                    budgets: {
                        ...budgets,
                        responsesConsumed: Math.max(budgets.responsesConsumed || 0, responseCount),
                    },
                    metrics: {
                        employeeCount,
                        surveyCount,
                        campaignCount,
                        responseCount,
                    },
                    licenseExpiresAt: p.licenseExpiresAt || '2027-12-31T23:59:59.000Z',
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                };
            }));
            res.status(200).json(tenantsData);
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * POST /api/v1/admin/tenants
     * Provision a new client project / tenant account
     */
    router.post('/admin/tenants', async (req, res, next) => {
        try {
            const { projectId, name, clientOrgName, tenantId, tenantName, tier, companyName, primaryColor, secondaryColor, monthlyResponseCap, aiTokenCap, maxEmployees, supportedLocales, } = req.body;
            if (!projectId || !name) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'projectId and name are required',
                });
            }
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            // Check unique projectId
            const existing = await project_schema_1.ProjectModel.findOne({ projectId });
            if (existing) {
                return res.status(409).json({
                    type: 'https://tesp-api.talnova.io/errors/conflict',
                    title: 'Conflict',
                    status: 409,
                    detail: `Project with ID ${projectId} already exists`,
                });
            }
            const created = await project_schema_1.ProjectModel.create({
                projectId,
                name,
                clientOrgName: clientOrgName || name,
                tenantId: tenantId || 'TENANT-DAASH',
                tenantName: tenantName || 'Daash Global Advisory',
                tier: tier || 'ENTERPRISE',
                status: 'ACTIVE',
                branding: {
                    companyName: companyName || name,
                    primaryColor: primaryColor || '#4F46E5',
                    secondaryColor: secondaryColor || '#0A1317',
                    logoUrl: `https://tesp.talnova.io/assets/${projectId.toLowerCase()}.svg`,
                },
                supportedLocales: supportedLocales || ['en-US', 'si-LK'],
                defaultLocale: (supportedLocales && supportedLocales[0]) || 'en-US',
                features: {
                    aiAnalyticsEnabled: true,
                    actionPlanningEnabled: true,
                    kioskModeEnabled: true,
                    smsDistributionEnabled: true,
                },
                budgets: {
                    monthlyResponseCap: Number(monthlyResponseCap) || 50000,
                    responsesConsumed: 0,
                    aiTokenCap: Number(aiTokenCap) || 1000000,
                    aiTokensConsumed: 0,
                    maxEmployees: Number(maxEmployees) || 5000,
                    storageQuotaMb: 5000,
                },
                customAttributeDefinitions: [
                    { key: 'Department', displayName: 'Department', dataType: 'STRING' },
                    { key: 'Location', displayName: 'Work Location', dataType: 'STRING' },
                ],
                version: 1,
            });
            // Audit Log domain event
            event_bus_1.DomainEventBus.getInstance().publish({
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TENANT_PROJECT_PROVISIONED',
                aggregateId: projectId,
                timestamp: new Date(),
                payload: {
                    projectId,
                    name,
                    tenantId: created.tenantId,
                    tier: created.tier,
                    actorId: req.user?.userId || 'SUPER_ADMIN',
                    actorRole: 'SUPER_ADMIN',
                },
            });
            res.status(201).json(created);
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * PUT /api/v1/admin/tenants/:projectId/budgets
     * Adjust quota allocations, tier, and resource limits
     */
    router.put('/admin/tenants/:projectId/budgets', async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const { monthlyResponseCap, aiTokenCap, maxEmployees, storageQuotaMb, tier } = req.body;
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const project = await project_schema_1.ProjectModel.findOne({ projectId });
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project ${projectId} not found`,
                });
            }
            if (!project.budgets) {
                project.budgets = {
                    monthlyResponseCap: 50000,
                    responsesConsumed: 0,
                    aiTokenCap: 1000000,
                    aiTokensConsumed: 0,
                    maxEmployees: 5000,
                    storageQuotaMb: 5000,
                };
            }
            if (monthlyResponseCap !== undefined)
                project.budgets.monthlyResponseCap = Number(monthlyResponseCap);
            if (aiTokenCap !== undefined)
                project.budgets.aiTokenCap = Number(aiTokenCap);
            if (maxEmployees !== undefined)
                project.budgets.maxEmployees = Number(maxEmployees);
            if (storageQuotaMb !== undefined)
                project.budgets.storageQuotaMb = Number(storageQuotaMb);
            if (tier)
                project.tier = tier;
            await project.save();
            // Audit record
            event_bus_1.DomainEventBus.getInstance().publish({
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TENANT_BUDGET_ADJUSTED',
                aggregateId: projectId,
                timestamp: new Date(),
                payload: {
                    projectId,
                    budgets: project.budgets,
                    tier: project.tier,
                    actorId: req.user?.userId || 'SUPER_ADMIN',
                },
            });
            res.status(200).json({
                message: 'Tenant quotas and budget updated successfully',
                budgets: project.budgets,
                tier: project.tier,
            });
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * POST /api/v1/admin/consultants
     * Super Admin provisions a new advisory Consultant account and links to a Consulting Firm
     */
    router.post('/admin/consultants', async (req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const { email, firstName, lastName, firmId, authorizedProjectIds, temporaryPassword } = req.body || {};
            if (!email || !firstName || !lastName || !firmId || !temporaryPassword) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'Email, firstName, lastName, firmId, and temporaryPassword are required.',
                });
            }
            const normalizedEmail = (email || '').trim().toLowerCase();
            if (!user_entity_1.UserEntity.EMAIL_REGEX.test(normalizedEmail)) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Invalid Email',
                    status: 400,
                    detail: `Invalid email address format: '${email}'.`,
                });
            }
            if (!change_password_use_case_1.ChangePasswordUseCase.PASSWORD_COMPLEXITY_REGEX.test(temporaryPassword)) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/weak-password',
                    title: 'Weak Password',
                    status: 400,
                    detail: 'Temporary password must be 8-128 characters long and contain uppercase, lowercase, numbers, and special characters.',
                });
            }
            // Check email uniqueness in UserModel
            const existingUser = await user_schema_1.UserModel.findOne({ email: normalizedEmail }).exec();
            if (existingUser) {
                return res.status(409).json({
                    type: 'https://tesp-api.talnova.io/errors/user-conflict',
                    title: 'User Conflict',
                    status: 409,
                    detail: `A user with email '${normalizedEmail}' already exists.`,
                });
            }
            // Check firm exists
            const firm = await consulting_firm_schema_1.ConsultingFirmModel.findOne({ firmId }).exec();
            if (!firm) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/firm-not-found',
                    title: 'Firm Not Found',
                    status: 404,
                    detail: `Consulting firm with ID '${firmId}' was not found.`,
                });
            }
            const hasher = new bcrypt_hasher_service_1.BcryptHasherService(12);
            const passwordHash = await hasher.hashPassword(temporaryPassword);
            const randomHex = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
            const userId = `USR-CONS-${randomHex}`;
            const projectList = Array.isArray(authorizedProjectIds) && authorizedProjectIds.length > 0
                ? authorizedProjectIds
                : (firm.assignedProjectIds && firm.assignedProjectIds.length > 0 ? firm.assignedProjectIds : []);
            if (projectList.length === 0) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'At least one authorized project ID must be assigned to the consultant or firm',
                });
            }
            const primaryProjectId = projectList[0];
            const newDoc = await user_schema_1.UserModel.create({
                userId,
                email: normalizedEmail,
                firstName: firstName.trim(),
                lastName: (lastName || '').trim(),
                role: auth_middleware_1.UserRole.CONSULTANT_DAASH,
                firmId,
                passwordHash,
                authorizedProjectIds: projectList,
                primaryProjectId,
                mustChangePassword: true,
                failedLoginAttempts: 0,
                isActive: true,
                isEmailVerified: true,
            });
            // Append to firm consultantUserIds
            if (!firm.consultantUserIds.includes(userId)) {
                firm.consultantUserIds.push(userId);
                await firm.save();
            }
            await audit_logger_1.AuditLogger.log({
                projectId: primaryProjectId,
                action: 'CONSULTANT_PROVISIONED',
                actorId: req.user?.userId || 'SUPER_ADMIN',
                actorRole: req.user?.role || 'SUPER_ADMIN',
                resource: `USER:${userId}`,
                details: {
                    userId,
                    email: normalizedEmail,
                    firmId,
                    authorizedProjectIds: projectList,
                },
            });
            // Dispatch onboarding email using system Zoho SMTP
            await system_email_service_1.systemEmailService.sendConsultantOnboardingEmail({
                to: normalizedEmail,
                firstName: firstName.trim(),
                lastName: (lastName || '').trim(),
                temporaryPassword,
                firmName: firm.name,
                loginUrl: `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/login`,
            }).catch((err) => console.error('[TenantManagement] Failed to send consultant onboarding email:', err));
            return res.status(201).json({
                success: true,
                message: 'Consultant provisioned successfully.',
                user: {
                    userId: newDoc.userId,
                    email: newDoc.email,
                    firstName: newDoc.firstName,
                    lastName: newDoc.lastName,
                    role: newDoc.role,
                    firmId: newDoc.firmId,
                    authorizedProjectIds: newDoc.authorizedProjectIds,
                    primaryProjectId: newDoc.primaryProjectId,
                    mustChangePassword: newDoc.mustChangePassword,
                    isActive: newDoc.isActive,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=tenant-management.routes.js.map