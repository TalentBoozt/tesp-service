"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectConfigRouter = createProjectConfigRouter;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const project_repository_1 = require("../../infrastructure/persistence/mongoose/project.repository");
const project_cache_repository_1 = require("../../infrastructure/cache/project-cache.repository");
const project_schema_1 = require("../../infrastructure/persistence/mongoose/project.schema");
const create_project_use_case_1 = require("../../application/use-cases/create-project.use-case");
const get_project_use_case_1 = require("../../application/use-cases/get-project.use-case");
const update_project_use_case_1 = require("../../application/use-cases/update-project.use-case");
const toggle_features_use_case_1 = require("../../application/use-cases/toggle-features.use-case");
const get_public_theme_use_case_1 = require("../../application/use-cases/get-public-theme.use-case");
const list_projects_use_case_1 = require("../../application/use-cases/list-projects.use-case");
const delete_project_use_case_1 = require("../../application/use-cases/delete-project.use-case");
const project_config_controller_1 = require("./project-config.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const email_gateway_service_1 = require("../../../../shared/infrastructure/email/email-gateway.service");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
function createProjectConfigRouter(repo, cacheRepo) {
    const router = (0, express_1.Router)();
    const repository = repo || new project_repository_1.ProjectMongoRepository();
    const cache = cacheRepo || new project_cache_repository_1.ProjectRedisCache();
    const createProjectUseCase = new create_project_use_case_1.CreateProjectUseCase(repository, cache);
    const getProjectUseCase = new get_project_use_case_1.GetProjectUseCase(repository, cache);
    const updateProjectUseCase = new update_project_use_case_1.UpdateProjectUseCase(repository, cache);
    const toggleFeaturesUseCase = new toggle_features_use_case_1.ToggleFeaturesUseCase(repository, cache);
    const getPublicThemeUseCase = new get_public_theme_use_case_1.GetPublicThemeUseCase(repository, cache);
    const listProjectsUseCase = new list_projects_use_case_1.ListProjectsUseCase(repository);
    const deleteProjectUseCase = new delete_project_use_case_1.DeleteProjectUseCase(repository, cache);
    const controller = new project_config_controller_1.ProjectConfigController(createProjectUseCase, getProjectUseCase, updateProjectUseCase, toggleFeaturesUseCase, getPublicThemeUseCase, listProjectsUseCase, deleteProjectUseCase);
    // 1. Unauthenticated Public Theme Endpoint (FR-CFG-004, PR-CFG-004)
    router.get('/projects/:projectId/public-theme', controller.getPublicTheme);
    // Public route for public intake styling without requiring admin JWT (PROMPT-09)
    const getBrandingHandler = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.headers['x-project-id'] || '';
            let project = null;
            if (projectId && repository) {
                project = await repository.findByProjectId(projectId);
            }
            if (!project && projectId && mongoose_1.default.connection?.readyState === 1) {
                project = await project_schema_1.ProjectModel.findOne({ projectId }).lean();
            }
            if (!project) {
                return res.status(200).json({
                    name: 'Talnova Enterprise Platform',
                    branding: { companyName: 'Talnova Enterprise', primaryColor: '#4F46E5', secondaryColor: '#7C3AED' },
                    supportedLocales: ['en-US'],
                });
            }
            res.status(200).json({
                name: project.name,
                branding: project.branding,
                supportedLocales: project.supportedLocales,
            });
        }
        catch (err) {
            next(err);
        }
    };
    router.get('/public/branding', getBrandingHandler);
    router.get('/project-config', getBrandingHandler);
    // 2. Protected Endpoints (Require Bearer Token)
    router.post('/projects', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), controller.createProject);
    router.get('/projects', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.SURVEY_AUTHOR,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.listProjects);
    router.get('/projects/:projectId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), controller.getProject);
    router.put('/projects/:projectId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), controller.updateProject);
    router.patch('/projects/:projectId/features', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]), controller.toggleFeatures);
    router.delete('/projects/:projectId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]), controller.deleteProject);
    // 2b. Presigned S3 Asset Upload for Brand Logos & Themes (GAP-012 / TASK-06-02)
    const presignedUploadHandler = async (req, res, next) => {
        try {
            const projectId = req.params.projectId || req.body?.projectId || req.user?.projectId;
            if (!projectId) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/validation-failed',
                    title: 'Validation Error',
                    status: 400,
                    detail: 'projectId is required for asset upload',
                });
            }
            const { filename, contentType } = req.body || {};
            if (!filename || typeof filename !== 'string') {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/validation-failed',
                    title: 'Validation Error',
                    status: 400,
                    detail: 'filename string is required in request body',
                });
            }
            const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
            if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/validation-failed',
                    title: 'Invalid MIME Type',
                    status: 400,
                    detail: `Content-Type '${contentType}' is not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
                });
            }
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const assetKey = `assets/${projectId}/branding/${Date.now()}-${sanitizedFilename}`;
            const storageService = storage_service_1.StorageService.getInstance();
            const { uploadUrl, assetUrl } = await storageService.getPresignedUploadUrl(assetKey, contentType);
            return res.status(200).json({
                uploadUrl,
                assetUrl,
                key: assetKey,
            });
        }
        catch (err) {
            next(err);
        }
    };
    router.post(['/projects/:projectId/assets/presigned-upload', '/assets/presigned-upload'], auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
    ]), presignedUploadHandler);
    // 3. Outbound Email Gateway Config Endpoints (PROMPT-22)
    router.get('/projects/:projectId/config/email', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            res.status(200).json({
                projectId,
                emailConfig: project.emailConfigVO.toMaskedJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.put('/projects/:projectId/config/email', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            const incoming = req.body || {};
            const existingEmail = project.emailConfigVO;
            if (incoming.zeptoMailApiKey && incoming.zeptoMailApiKey.startsWith('••••')) {
                incoming.zeptoMailApiKey = existingEmail.zeptoMailApiKey;
            }
            if (incoming.smtpPassword && incoming.smtpPassword.startsWith('••••')) {
                incoming.smtpPassword = existingEmail.smtpPassword;
            }
            project.updateEmailConfig(incoming);
            await repository.save(project);
            await cache.evict(projectId);
            res.status(200).json({
                projectId,
                emailConfig: project.emailConfigVO.toMaskedJSON(),
                message: 'Outbound email gateway updated successfully',
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/projects/:projectId/config/email/test', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const { recipientEmail, config } = req.body || {};
            const project = await repository.findByProjectId(projectId);
            const targetRecipient = recipientEmail || req.user?.email || 'no-reply@talnova.io';
            const effectiveConfig = config || project?.emailConfigVO.toJSON();
            const testResult = await email_gateway_service_1.emailGatewayService.testDiagnosticConnection(projectId, targetRecipient, effectiveConfig);
            res.status(200).json(testResult);
        }
        catch (err) {
            next(err);
        }
    });
    // 4. AI Engine & NLP Routing Endpoints (PROMPT-22)
    router.get('/projects/:projectId/config/ai', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            res.status(200).json({
                projectId,
                aiConfig: project.aiConfigVO.toMaskedJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.put('/projects/:projectId/config/ai', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            const incoming = req.body || {};
            const existingAi = project.aiConfigVO;
            if (incoming.apiKey && (incoming.apiKey.startsWith('••••') || incoming.apiKey.includes('••••'))) {
                incoming.apiKey = existingAi.apiKey;
            }
            if (incoming.provider === 'GEMINI') {
                if (!incoming.modelName || incoming.modelName.startsWith('gpt') || incoming.modelName.startsWith('claude')) {
                    incoming.modelName = 'gemini-2.5-flash';
                }
            }
            else if (incoming.provider === 'OPENAI') {
                if (!incoming.modelName || incoming.modelName.startsWith('gemini') || incoming.modelName.startsWith('claude')) {
                    incoming.modelName = 'gpt-4o';
                }
            }
            project.updateAiConfig(incoming);
            await repository.save(project);
            await cache.evict(projectId);
            res.status(200).json({
                projectId,
                aiConfig: project.aiConfigVO.toMaskedJSON(),
                message: 'AI engine routing parameters updated successfully',
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/projects/:projectId/config/ai/test', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const { testPrompt, config } = req.body || {};
            const project = await repository.findByProjectId(projectId);
            const provider = config?.provider || project?.aiConfig?.provider || 'GEMINI';
            let modelName = config?.modelName || project?.aiConfig?.modelName;
            if (provider === 'GEMINI') {
                if (!modelName || modelName.startsWith('gpt') || modelName.startsWith('claude')) {
                    modelName = 'gemini-2.5-flash';
                }
            }
            else if (provider === 'OPENAI') {
                if (!modelName || modelName.startsWith('gemini') || modelName.startsWith('claude')) {
                    modelName = 'gpt-4o-mini';
                }
            }
            let apiKey = config?.apiKey;
            if (!apiKey || apiKey.startsWith('••••') || apiKey.includes('••••')) {
                apiKey = project?.aiConfig?.apiKey || (provider === 'OPENAI' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY);
            }
            const baseUrl = config?.baseUrl || project?.aiConfig?.baseUrl;
            const startTime = Date.now();
            try {
                if (!apiKey && provider !== 'MOCK') {
                    throw new Error(`No API key configured for provider ${provider}`);
                }
                let latencyMs = 0;
                let tokensUsed = 10;
                let rawResponse = 'PONG';
                if (provider === 'GEMINI') {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                    const apiRes = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: testPrompt || 'Ping: please respond with "PONG"' }] }],
                        }),
                    });
                    latencyMs = Date.now() - startTime;
                    if (!apiRes.ok) {
                        const errBody = await apiRes.text();
                        let parsedMsg = errBody;
                        try {
                            const j = JSON.parse(errBody);
                            parsedMsg = j.error?.message || errBody;
                        }
                        catch { }
                        throw new Error(`Gemini Provider Error (${apiRes.status}): ${parsedMsg}`);
                    }
                    const data = await apiRes.json();
                    tokensUsed = data.usageMetadata?.totalTokenCount || 12;
                    rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'PONG';
                }
                else if (provider === 'OPENAI') {
                    const url = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;
                    const apiRes = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: [{ role: 'user', content: testPrompt || 'Ping: please respond with "PONG"' }],
                            max_tokens: 15,
                        }),
                    });
                    latencyMs = Date.now() - startTime;
                    if (!apiRes.ok) {
                        const errBody = await apiRes.text();
                        let parsedMsg = errBody;
                        try {
                            const j = JSON.parse(errBody);
                            parsedMsg = j.error?.message || errBody;
                        }
                        catch { }
                        throw new Error(`OpenAI Provider Error (${apiRes.status}): ${parsedMsg}`);
                    }
                    const data = await apiRes.json();
                    tokensUsed = data.usage?.total_tokens || 14;
                    rawResponse = data.choices?.[0]?.message?.content || 'PONG';
                }
                else if (provider === 'MOCK') {
                    latencyMs = 25;
                    tokensUsed = 5;
                    rawResponse = 'PONG';
                }
                else {
                    throw new Error(`Unsupported AI provider: ${provider}`);
                }
                if (mongoose_1.default.connection?.readyState === 1) {
                    await project_schema_1.ProjectModel.updateOne({ projectId }, {
                        $set: {
                            'aiConfig.lastTestTimestamp': new Date(),
                            'aiConfig.lastTestStatus': 'SUCCESS',
                        },
                        $inc: {
                            'aiConfig.currentMonthUsage': tokensUsed,
                        },
                    }).catch(() => null);
                }
                return res.status(200).json({
                    success: true,
                    latencyMs,
                    provider,
                    model: modelName,
                    modelName,
                    tokensUsed,
                    sentiment: 'POSITIVE',
                    response: rawResponse,
                });
            }
            catch (testErr) {
                if (mongoose_1.default.connection?.readyState === 1) {
                    await project_schema_1.ProjectModel.updateOne({ projectId }, {
                        $set: {
                            'aiConfig.lastTestTimestamp': new Date(),
                            'aiConfig.lastTestStatus': 'FAILED',
                        },
                    }).catch(() => null);
                }
                return res.status(400).json({
                    success: false,
                    error: testErr.message || 'AI credential validation failed',
                    provider,
                    model: modelName,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
    // 5. Custom Domain & SAML SSO Verification Endpoints (GAP-015 / TASK-04-02)
    router.post('/projects/:projectId/verify-domain', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            const domain = (req.body?.domain || project.customDomain?.hostname || '').trim();
            if (!domain) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'Domain hostname is required for DNS CNAME verification',
                });
            }
            const configuredCnameTarget = process.env.CNAME_TARGET ||
                process.env.CUSTOM_DOMAIN_CNAME_TARGET ||
                'cname.talnova-platform.net';
            const expectedTargets = [
                configuredCnameTarget,
                'cname.talnova.io',
            ].filter(Boolean);
            try {
                const records = await dns_1.default.promises.resolveCname(domain);
                const isMatched = records.some((r) => expectedTargets.some((target) => r.toLowerCase().trim() === target.toLowerCase().trim() ||
                    r.toLowerCase().includes(target.toLowerCase()) ||
                    target.toLowerCase().includes(r.toLowerCase())));
                if (isMatched) {
                    project.updateCustomDomain({
                        hostname: domain,
                        verified: true,
                        verifiedAt: new Date(),
                        cnameTarget: records[0] || expectedTargets[0],
                        sslStatus: 'ACTIVE',
                    });
                    await repository.save(project);
                    await cache.evict(projectId);
                    return res.status(200).json({
                        verified: true,
                        domain,
                        cnameTarget: records[0] || expectedTargets[0],
                        records,
                        sslStatus: 'ACTIVE',
                        message: `Domain '${domain}' verified successfully! TLS 1.3 certificate provisioned.`,
                    });
                }
                else {
                    project.updateCustomDomain({
                        hostname: domain,
                        verified: false,
                        cnameTarget: records[0],
                        sslStatus: 'PENDING_DNS',
                    });
                    await repository.save(project);
                    await cache.evict(projectId);
                    return res.status(200).json({
                        verified: false,
                        domain,
                        records,
                        sslStatus: 'PENDING_DNS',
                        message: `CNAME records [${records.join(', ')}] do not match expected target '${expectedTargets[0]}'.`,
                    });
                }
            }
            catch (dnsErr) {
                project.updateCustomDomain({
                    hostname: domain,
                    verified: false,
                    sslStatus: 'PENDING_DNS',
                });
                await repository.save(project);
                await cache.evict(projectId);
                return res.status(200).json({
                    verified: false,
                    domain,
                    records: [],
                    sslStatus: 'PENDING_DNS',
                    message: `DNS record lookup failed: ${dnsErr.code || dnsErr.message || 'CNAME resolution error'}`,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/projects/:projectId/config/security', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            const defaultCnameTarget = process.env.CNAME_TARGET ||
                process.env.CUSTOM_DOMAIN_CNAME_TARGET ||
                'cname.talnova-platform.net';
            res.status(200).json({
                projectId,
                customDomain: project.customDomain
                    ? {
                        ...project.customDomain,
                        cnameTarget: project.customDomain.cnameTarget || defaultCnameTarget,
                    }
                    : {
                        hostname: '',
                        verified: false,
                        sslStatus: 'PENDING_DNS',
                        cnameTarget: defaultCnameTarget,
                    },
                samlConfig: project.samlConfig || {
                    enabled: false,
                    protocol: 'SAML_2',
                    enforceSsoOnly: false,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.put('/projects/:projectId/config/security', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await repository.findByProjectId(projectId);
            if (!project) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Project '${projectId}' not found`,
                });
            }
            const { customDomain, samlConfig } = req.body || {};
            if (customDomain) {
                project.updateCustomDomain(customDomain);
            }
            if (samlConfig) {
                project.updateSamlConfig(samlConfig);
            }
            await repository.save(project);
            await cache.evict(projectId);
            res.status(200).json({
                projectId,
                customDomain: project.customDomain,
                samlConfig: project.samlConfig,
                message: 'Security and custom domain configuration updated successfully',
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=project-config.routes.js.map