"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_ALIASES = exports.UserRole = void 0;
exports.normalizeUserRole = normalizeUserRole;
exports.generateToken = generateToken;
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.enforceProjectScope = enforceProjectScope;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../../config");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["PROJECT_ADMIN"] = "PROJECT_ADMIN";
    UserRole["CONSULTANT"] = "CONSULTANT";
    UserRole["CONSULTANT_DAASH"] = "CONSULTANT_DAASH";
    UserRole["ORG_ADMIN"] = "ORG_ADMIN";
    UserRole["HR_MANAGER"] = "HR_MANAGER";
    UserRole["DEPARTMENT_MANAGER"] = "DEPARTMENT_MANAGER";
    UserRole["SURVEY_AUTHOR"] = "SURVEY_AUTHOR";
    UserRole["REPORT_VIEWER"] = "REPORT_VIEWER";
    UserRole["SURVEY_RESPONDENT"] = "SURVEY_RESPONDENT";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLE_ALIASES = {
    MANAGER: UserRole.DEPARTMENT_MANAGER,
    ANALYST: UserRole.REPORT_VIEWER,
    VIEWER: UserRole.REPORT_VIEWER,
    EMPLOYEE: UserRole.SURVEY_RESPONDENT,
    // Canonical roles map directly to themselves
    PROJECT_ADMIN: UserRole.PROJECT_ADMIN,
    SUPER_ADMIN: UserRole.SUPER_ADMIN,
    CONSULTANT: UserRole.CONSULTANT,
    CONSULTANT_DAASH: UserRole.CONSULTANT_DAASH,
    ORG_ADMIN: UserRole.ORG_ADMIN,
    HR_MANAGER: UserRole.HR_MANAGER,
    DEPARTMENT_MANAGER: UserRole.DEPARTMENT_MANAGER,
    SURVEY_AUTHOR: UserRole.SURVEY_AUTHOR,
    REPORT_VIEWER: UserRole.REPORT_VIEWER,
    SURVEY_RESPONDENT: UserRole.SURVEY_RESPONDENT,
};
function normalizeUserRole(role) {
    return exports.ROLE_ALIASES[role] || role;
}
function generateToken(payload) {
    const normalizedPayload = {
        ...payload,
        role: normalizeUserRole(payload.role),
    };
    return jsonwebtoken_1.default.sign(normalizedPayload, config_1.config.jwtSecret, { expiresIn: '8h' });
}
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        res.status(401).json({
            type: 'https://tesp-api.talnova.io/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'Missing or invalid Authorization bearer token',
            instance: req.originalUrl,
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = {
            ...decoded,
            role: normalizeUserRole(decoded.role),
        };
        if (req.user.mustChangePassword) {
            const url = req.originalUrl || req.url || req.path || '';
            const allowedPaths = ['/auth/change-password', '/auth/logout', '/auth/me', '/campaigns/my-surveys', '/survey-history'];
            const isAllowed = allowedPaths.some((p) => url.includes(p));
            if (!isAllowed) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/password-change-required',
                    title: 'Forbidden',
                    status: 403,
                    code: 'ERR_MUST_CHANGE_PASSWORD',
                    error: 'Password change required before accessing system resources',
                    detail: 'Password change required before accessing system resources',
                    instance: req.originalUrl || req.url,
                });
                return;
            }
        }
        next();
    }
    catch {
        res.status(401).json({
            type: 'https://tesp-api.talnova.io/errors/invalid-token',
            title: 'Unauthorized',
            status: 401,
            detail: 'Token is invalid or expired',
            instance: req.originalUrl,
        });
    }
}
function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                status: 401,
                detail: 'User context is missing',
                instance: req.originalUrl,
            });
            return;
        }
        if (req.user.mustChangePassword) {
            const url = req.originalUrl || req.url || req.path || '';
            const allowedPaths = ['/auth/change-password', '/auth/logout', '/auth/me'];
            const isAllowed = allowedPaths.some((p) => url.includes(p));
            if (!isAllowed) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/password-change-required',
                    title: 'Forbidden',
                    status: 403,
                    code: 'ERR_MUST_CHANGE_PASSWORD',
                    error: 'Password change required before accessing system resources',
                    detail: 'Password change required before accessing system resources',
                    instance: req.originalUrl || req.url,
                });
                return;
            }
        }
        const effectiveRole = normalizeUserRole(req.user.role);
        const normalizedAllowed = allowedRoles.map((r) => normalizeUserRole(r));
        const isConsultantEffective = effectiveRole === UserRole.CONSULTANT || effectiveRole === UserRole.CONSULTANT_DAASH;
        const allowsConsultant = normalizedAllowed.includes(UserRole.CONSULTANT) || normalizedAllowed.includes(UserRole.CONSULTANT_DAASH);
        const isRoleAuthorized = normalizedAllowed.includes(effectiveRole) || (isConsultantEffective && allowsConsultant);
        if (!isRoleAuthorized && effectiveRole !== UserRole.SUPER_ADMIN) {
            res.status(403).json({
                type: 'https://tesp-api.talnova.io/errors/forbidden',
                title: 'Forbidden',
                status: 403,
                detail: `User role '${req.user.role}' is not authorized to perform this operation`,
                instance: req.originalUrl,
            });
            return;
        }
        // Tenant Scope Isolation Check (BR-CFG-003)
        const isProjectCreation = req.method === 'POST' && (req.path === '/projects' || req.originalUrl?.endsWith('/projects'));
        const isConsultantRole = effectiveRole === UserRole.CONSULTANT || effectiveRole === UserRole.CONSULTANT_DAASH;
        if (!isProjectCreation || !isConsultantRole) {
            const headerProjectId = (req.headers['x-project-id'] || req.headers['x-tenant-id'] || '').trim() || undefined;
            const queryProjectId = typeof req.query?.projectId === 'string' ? req.query.projectId.trim() : undefined;
            const targetProjectId = req.params.projectId || req.body?.projectId || queryProjectId || headerProjectId;
            if (effectiveRole !== UserRole.SUPER_ADMIN &&
                !req.user.authorizedProjectIds?.includes('*') &&
                targetProjectId) {
                const isAuthorized = (req.user.projectId && req.user.projectId === targetProjectId) ||
                    (req.user.authorizedProjectIds && req.user.authorizedProjectIds.includes(targetProjectId));
                if (!isAuthorized) {
                    res.status(403).json({
                        type: 'https://tesp-api.talnova.io/errors/tenant-access-denied',
                        title: 'Forbidden',
                        status: 403,
                        detail: `Access denied to project '${targetProjectId}'. Authorized scope is '${req.user.projectId}'`,
                        instance: req.originalUrl,
                    });
                    return;
                }
            }
            // Automatically scope query.projectId if missing and user is not SuperAdmin
            if (effectiveRole !== UserRole.SUPER_ADMIN && !req.query.projectId && req.user.projectId) {
                req.query.projectId = req.user.projectId;
            }
        }
        next();
    };
}
function enforceProjectScope(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            type: 'https://tesp-api.talnova.io/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'User context is missing',
            instance: req.originalUrl,
        });
        return;
    }
    const effectiveRole = normalizeUserRole(req.user.role);
    if (effectiveRole === UserRole.SUPER_ADMIN || req.user.authorizedProjectIds?.includes('*')) {
        return next();
    }
    const headerProjectId = (req.headers['x-project-id'] || req.headers['x-tenant-id'] || '').trim() || undefined;
    const queryProjectId = typeof req.query?.projectId === 'string' ? req.query.projectId.trim() : undefined;
    const targetProjectId = req.params.projectId || req.body?.projectId || queryProjectId || headerProjectId;
    if (targetProjectId) {
        const isAuthorized = (req.user.projectId && req.user.projectId === targetProjectId) ||
            (req.user.authorizedProjectIds && req.user.authorizedProjectIds.includes(targetProjectId));
        if (!isAuthorized) {
            res.status(403).json({
                type: 'https://tesp-api.talnova.io/errors/tenant-access-denied',
                title: 'Forbidden',
                status: 403,
                detail: `Access denied to project '${targetProjectId}'. Authorized scope is '${req.user.projectId}'`,
                instance: req.originalUrl,
            });
            return;
        }
    }
    if (!req.query.projectId && req.user.projectId) {
        req.query.projectId = req.user.projectId;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map