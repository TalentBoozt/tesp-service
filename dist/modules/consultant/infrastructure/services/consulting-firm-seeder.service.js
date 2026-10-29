"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultingFirmSeederService = void 0;
const consulting_firm_entity_1 = require("../../domain/entities/consulting-firm.entity");
const mongo_consulting_firm_repository_1 = require("../persistence/mongoose/mongo-consulting-firm.repository");
class ConsultingFirmSeederService {
    repo;
    constructor(repo = new mongo_consulting_firm_repository_1.MongoConsultingFirmRepository()) {
        this.repo = repo;
    }
    async seedDefaultFirms(forceOverwrite = false) {
        const isProduction = process.env.NODE_ENV === 'production';
        const allowDemo = process.env.ALLOW_DEMO_SEEDING === 'true';
        if (isProduction && !allowDemo) {
            console.log('[ConsultingFirmSeeder] Production mode active without ALLOW_DEMO_SEEDING=true. Skipping demo consulting firm seeding.');
            return;
        }
        const defaultFirms = [
            new consulting_firm_entity_1.ConsultingFirmEntity({
                firmId: 'FIRM-DAASH-01',
                name: 'Daash Global Advisory',
                slug: 'daash-global',
                contactEmail: 'consultant@daashglobal.com',
                tier: 'ENTERPRISE',
                assignedProjectIds: ['PRJ-99201', 'PRJ-99202', 'PRJ-APAC01', 'PRJ-NESTLE'],
                consultantUserIds: ['USR-CONSULTANT-01'],
                isActive: true,
            }),
            new consulting_firm_entity_1.ConsultingFirmEntity({
                firmId: 'FIRM-TALNOVA-01',
                name: 'Talnova Advisory Partners',
                slug: 'talnova-advisory',
                contactEmail: 'advisory@talnova.io',
                tier: 'INTERNAL',
                assignedProjectIds: ['PRJ-99201'],
                consultantUserIds: ['USR-SUPERADMIN'],
                isActive: true,
            }),
        ];
        for (const firm of defaultFirms) {
            const existing = await this.repo.findByFirmId(firm.firmId);
            if (!existing || forceOverwrite) {
                await this.repo.save(firm);
            }
        }
    }
    async ensureDefaultFirmsExist() {
        const isProduction = process.env.NODE_ENV === 'production';
        const allowDemo = process.env.ALLOW_DEMO_SEEDING === 'true';
        if (isProduction && !allowDemo) {
            console.log('[ConsultingFirmSeeder] Production mode active without ALLOW_DEMO_SEEDING=true. Skipping demo consulting firm seeding.');
            return;
        }
        const count = await this.repo.count();
        if (count === 0) {
            await this.seedDefaultFirms(false);
        }
    }
}
exports.ConsultingFirmSeederService = ConsultingFirmSeederService;
//# sourceMappingURL=consulting-firm-seeder.service.js.map