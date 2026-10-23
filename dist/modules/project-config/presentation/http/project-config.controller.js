"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfigController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const project_config_dto_1 = require("../dto/project-config.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const wcag_contrast_validator_1 = require("../../domain/services/wcag-contrast.validator");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
class ProjectConfigController {
    createProjectUseCase;
    getProjectUseCase;
    updateProjectUseCase;
    toggleFeaturesUseCase;
    getPublicThemeUseCase;
    listProjectsUseCase;
    deleteProjectUseCase;
    constructor(createProjectUseCase, getProjectUseCase, updateProjectUseCase, toggleFeaturesUseCase, getPublicThemeUseCase, listProjectsUseCase, deleteProjectUseCase) {
        this.createProjectUseCase = createProjectUseCase;
        this.getProjectUseCase = getProjectUseCase;
        this.updateProjectUseCase = updateProjectUseCase;
        this.toggleFeaturesUseCase = toggleFeaturesUseCase;
        this.getPublicThemeUseCase = getPublicThemeUseCase;
        this.listProjectsUseCase = listProjectsUseCase;
        this.deleteProjectUseCase = deleteProjectUseCase;
    }
    createProject = async (req, res, next) => {
        try {
            const parsed = project_config_dto_1.CreateProjectSchema.safeParse(req.body);
            if (!parsed.success) {
                const errorDetail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, errorDetail, 'https://tesp-api.talnova.io/errors/validation-failed', parsed.error.format());
            }
            // If created by a Consultant, link project tenantId to consultant firmId
            if (req.user && req.user.role === auth_middleware_1.UserRole.CONSULTANT_DAASH && mongoose_1.default.connection?.readyState === 1) {
                const consultantUser = await user_schema_1.UserModel.findOne({ userId: req.user.userId }).exec();
                if (consultantUser?.firmId) {
                    parsed.data.tenantId = consultantUser.firmId;
                }
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const project = await this.createProjectUseCase.execute(parsed.data, actorContext);
            // Automatically append project to consultant's authorizedProjectIds in UserModel
            if (req.user && req.user.role === auth_middleware_1.UserRole.CONSULTANT_DAASH && project.projectId && mongoose_1.default.connection?.readyState === 1) {
                await user_schema_1.UserModel.updateOne({ userId: req.user.userId }, { $addToSet: { authorizedProjectIds: project.projectId } }).exec();
            }
            // Perform WCAG Contrast Advisory check (Sec 20 feature)
            const contrastCheck = wcag_contrast_validator_1.WcagContrastValidator.validateContrastAgainstWhite(project.branding.primaryColor);
            res.status(201).json({
                data: project.toJSON(),
                wcagAccessibility: contrastCheck,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getProject = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const project = await this.getProjectUseCase.execute(projectId);
            res.status(200).json({ data: project.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    updateProject = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const parsed = project_config_dto_1.UpdateProjectSchema.safeParse(req.body);
            if (!parsed.success) {
                const errorDetail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, errorDetail, 'https://tesp-api.talnova.io/errors/validation-failed', parsed.error.format());
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const updated = await this.updateProjectUseCase.execute(projectId, parsed.data, actorContext);
            const contrastCheck = wcag_contrast_validator_1.WcagContrastValidator.validateContrastAgainstWhite(updated.branding.primaryColor);
            res.status(200).json({
                data: updated.toJSON(),
                wcagAccessibility: contrastCheck,
            });
        }
        catch (err) {
            next(err);
        }
    };
    toggleFeatures = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const parsed = project_config_dto_1.ToggleFeaturesSchema.safeParse(req.body);
            if (!parsed.success) {
                const errorDetail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, errorDetail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const updated = await this.toggleFeaturesUseCase.execute(projectId, parsed.data, actorContext);
            res.status(200).json({ data: updated.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getPublicTheme = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const theme = await this.getPublicThemeUseCase.execute(projectId);
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.status(200).json(theme);
        }
        catch (err) {
            next(err);
        }
    };
    listProjects = async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const status = req.query.status;
            const result = await this.listProjectsUseCase.execute({ page, limit, status });
            res.status(200).json({
                data: result.projects.map((p) => p.toJSON()),
                meta: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (err) {
            next(err);
        }
    };
    deleteProject = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            await this.deleteProjectUseCase.execute(projectId, actorContext);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ProjectConfigController = ProjectConfigController;
//# sourceMappingURL=project-config.controller.js.map