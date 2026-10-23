"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignoffAiFindingUseCase = exports.GetSignoffQueueUseCase = exports.ListWorkshopsUseCase = exports.CreateWorkshopUseCase = exports.GetBenchmarksUseCase = exports.ListEngagementsUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class ListEngagementsUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId) {
        return await this.consultantRepo.findEngagements(projectId);
    }
}
exports.ListEngagementsUseCase = ListEngagementsUseCase;
class GetBenchmarksUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(sector, _projectId) {
        const benchmarks = await this.consultantRepo.findBenchmarks(sector);
        return benchmarks;
    }
}
exports.GetBenchmarksUseCase = GetBenchmarksUseCase;
class CreateWorkshopUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(dto) {
        if (!dto.title) {
            throw new error_middleware_1.AppError(400, 'Workshop title is required');
        }
        if (!dto.clientName) {
            throw new error_middleware_1.AppError(400, 'Client name is required');
        }
        return await this.consultantRepo.createWorkshop({
            projectId: dto.projectId || 'PRJ-99201',
            title: dto.title,
            clientName: dto.clientName,
            consultantLead: dto.consultantLead || 'Dr. Samantha Perera (Daash Global)',
            scheduledDate: dto.scheduledDate || new Date().toISOString().split('T')[0],
            status: dto.status || 'READY_FOR_EXEC',
            keyThemes: dto.keyThemes || [],
            recommendedInterventions: dto.recommendedInterventions || [],
            actionPlanIds: dto.actionPlanIds || [],
        });
    }
}
exports.CreateWorkshopUseCase = CreateWorkshopUseCase;
class ListWorkshopsUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId) {
        return await this.consultantRepo.findWorkshops(projectId);
    }
}
exports.ListWorkshopsUseCase = ListWorkshopsUseCase;
class GetSignoffQueueUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId) {
        return await this.consultantRepo.findSignoffQueue(projectId);
    }
}
exports.GetSignoffQueueUseCase = GetSignoffQueueUseCase;
class SignoffAiFindingUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(findingId, notes, consultantEmail = 'consultant@daashglobal.com') {
        if (!findingId) {
            throw new error_middleware_1.AppError(400, 'Finding ID is required');
        }
        const item = await this.consultantRepo.findSignoffById(findingId);
        if (!item) {
            throw new error_middleware_1.AppError(404, `AI Signoff item '${findingId}' not found`);
        }
        item.signoff(notes, consultantEmail);
        return await this.consultantRepo.saveSignoff(item);
    }
}
exports.SignoffAiFindingUseCase = SignoffAiFindingUseCase;
//# sourceMappingURL=consultant.use-cases.js.map