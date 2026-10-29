"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express_1 = require("express");
const login_use_case_1 = require("../../application/use-cases/login.use-case");
const switch_project_use_case_1 = require("../../application/use-cases/switch-project.use-case");
const password_recovery_use_case_1 = require("../../application/use-cases/password-recovery.use-case");
const invite_user_use_case_1 = require("../../application/use-cases/invite-user.use-case");
const change_password_use_case_1 = require("../../application/use-cases/change-password.use-case");
const auth_seeder_service_1 = require("../../infrastructure/services/auth-seeder.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const rate_limit_middleware_1 = require("../../../../shared/presentation/middleware/rate-limit.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../../../config");
function createAuthRouter() {
    const router = (0, express_1.Router)();
    const loginUseCase = new login_use_case_1.LoginUseCase();
    const switchProjectUseCase = new switch_project_use_case_1.SwitchProjectUseCase();
    const passwordRecoveryUseCase = new password_recovery_use_case_1.PasswordRecoveryUseCase();
    const inviteUserUseCase = new invite_user_use_case_1.InviteUserUseCase();
    const changePasswordUseCase = new change_password_use_case_1.ChangePasswordUseCase();
    const seederService = new auth_seeder_service_1.AuthSeederService();
    // 1. Production Login Endpoint (Supports Email, Employee ID, or Phone)
    router.post('/login', rate_limit_middleware_1.authRateLimiter, async (req, res) => {
        try {
            const { identifier, email, password, projectId } = req.body || {};
            const result = await loginUseCase.execute({
                identifier: identifier || email,
                email,
                password,
                projectId,
            });
            return res.status(200).json(result);
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/internal-server-error',
                title: err.title || 'Authentication Error',
                status,
                detail: err.detail || err.message || 'An unexpected authentication error occurred.',
                instance: req.originalUrl,
            });
        }
    });
    // 1.1 Forced / First-Login Password Change (Authenticated)
    router.post('/change-password', auth_middleware_1.authenticate, async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    type: 'https://tesp-api.talnova.io/errors/unauthorized',
                    title: 'Unauthorized',
                    status: 401,
                    detail: 'User session is missing.',
                });
            }
            const { currentPassword, newPassword, confirmPassword } = req.body || {};
            const result = await changePasswordUseCase.execute({
                userId,
                currentPassword,
                newPassword,
                confirmPassword,
                projectId: req.user?.projectId,
            });
            return res.status(200).json(result);
        }
        catch (err) {
            const status = err.status || 400;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/change-password-failed',
                title: err.title || 'Change Password Error',
                status,
                detail: err.detail || err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 2. Tenant Context Switcher (Authenticated)
    router.post('/switch-project', auth_middleware_1.authenticate, async (req, res) => {
        try {
            const targetProjectId = req.body?.projectId;
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    type: 'https://tesp-api.talnova.io/errors/unauthorized',
                    title: 'Unauthorized',
                    status: 401,
                    detail: 'User session is missing.',
                });
            }
            const result = await switchProjectUseCase.execute({ userId, targetProjectId });
            return res.status(200).json(result);
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/tenant-switch-failed',
                title: err.title || 'Switch Project Error',
                status,
                detail: err.detail || err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 3. User Invitation (Authenticated, Role-Guarded)
    router.post('/invite', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res) => {
        try {
            const { email, firstName, lastName, role, projectId, firmId } = req.body || {};
            const result = await inviteUserUseCase.execute({
                inviterRole: req.user.role,
                inviterProjectId: req.user.projectId,
                email,
                firstName,
                lastName,
                role,
                projectId: projectId || req.user?.projectId,
                firmId,
            });
            return res.status(201).json(result);
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/invite-failed',
                title: err.title || 'Invite User Error',
                status,
                detail: err.detail || err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 4. Request Password Reset (Public)
    router.post('/forgot-password', rate_limit_middleware_1.authRateLimiter, async (req, res) => {
        try {
            const { email } = req.body || {};
            const result = await passwordRecoveryUseCase.requestPasswordReset(email);
            return res.status(200).json(result);
        }
        catch (err) {
            const status = err.status || 500;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/forgot-password-failed',
                title: err.title || 'Password Reset Request Error',
                status,
                detail: err.detail || err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 5. Reset Password with Token (Public)
    router.post('/reset-password', rate_limit_middleware_1.authRateLimiter, async (req, res) => {
        try {
            const { token, newPassword } = req.body || {};
            const result = await passwordRecoveryUseCase.resetPassword(token, newPassword);
            return res.status(200).json(result);
        }
        catch (err) {
            const status = err.status || 400;
            return res.status(status).json({
                type: err.type || 'https://tesp-api.talnova.io/errors/reset-password-failed',
                title: err.title || 'Password Reset Error',
                status,
                detail: err.detail || err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 6. Current User Profile (Authenticated)
    router.get('/me', auth_middleware_1.authenticate, async (req, res) => {
        return res.status(200).json({
            userId: req.user?.userId,
            role: req.user?.role,
            projectId: req.user?.projectId,
        });
    });
    // 7. Seed / Re-sync Default Accounts (Utility)
    router.post('/seed', async (req, res) => {
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const adminSeedSecret = process.env.ADMIN_SEED_SECRET;
        const providedSecret = req.headers['x-admin-seed-secret'];
        let isSuperAdmin = false;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
                if (decoded && (0, auth_middleware_1.normalizeUserRole)(decoded.role) === auth_middleware_1.UserRole.SUPER_ADMIN) {
                    isSuperAdmin = true;
                }
            }
            catch {
                // Fall through to secret check
            }
        }
        if (!isSuperAdmin) {
            if (!adminSeedSecret || !providedSecret || providedSecret !== adminSeedSecret) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Valid X-Admin-Seed-Secret header or SuperAdmin authorization required.',
                });
            }
        }
        try {
            await seederService.seedDefaultUsers(true);
            return res.status(200).json({ success: true, message: 'Default seed users verified and created.' });
        }
        catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=auth.routes.js.map