"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDemoSeed = runDemoSeed;
const database_1 = require("../database");
const audit_log_service_1 = require("../../../../modules/audit-log/application/services/audit-log.service");
const consultant_repository_1 = require("../../../../modules/consultant/infrastructure/persistence/mongoose/consultant.repository");
const hris_config_model_1 = require("../../../../modules/employee/infrastructure/persistence/mongoose/hris-config.model");
const mongoose_1 = __importDefault(require("mongoose"));
async function runDemoSeed() {
    if (process.env.NODE_ENV === 'production') {
        console.error('ERROR: Database demo seeding is strictly prohibited in production environment.');
        process.exit(1);
    }
    console.log('--- [TESP CLI Demo Seeder] Initializing Non-Production Seed Run ---');
    await database_1.Database.connect();
    const auditService = audit_log_service_1.AuditLogService.getInstance();
    const consultantRepo = new consultant_repository_1.ConsultantMongoRepository();
    console.log('[Demo Seeder] Seeding industry benchmarks, consultant engagements & workshops...');
    await consultantRepo.seedDefaultsIfEmpty();
    console.log('[Demo Seeder] Seeding demo audit trail entries for client projects...');
    const demoProjects = ['PRJ-99201', 'PRJ-APAC01', 'PRJ-NESTLE'];
    for (const pid of demoProjects) {
        await auditService.seedDefaultsIfEmpty(pid);
    }
    console.log('[Demo Seeder] Ensuring demo HRIS connector configuration for PRJ-99201...');
    const existingHris = await hris_config_model_1.HrisConfigModel.findOne({ projectId: 'PRJ-99201' });
    if (!existingHris) {
        await hris_config_model_1.HrisConfigModel.create({
            projectId: 'PRJ-99201',
            provider: 'WORKDAY',
            tenantUrl: 'https://wd2-services.workday.com/ccx/api/v1/enterprise',
            clientId: 'tesp_hris_client_9920',
            clientSecret: '••••••••••••••••',
            syncSchedule: 'NIGHTLY',
            lastSyncAt: new Date(),
            syncedCount: 142,
            status: 'CONNECTED',
        });
    }
    console.log('--- [TESP CLI Demo Seeder] Demo seed completed successfully! ---');
}
// Execute when invoked directly from CLI
if (require.main === module) {
    runDemoSeed()
        .then(async () => {
        await mongoose_1.default.disconnect();
        process.exit(0);
    })
        .catch(async (err) => {
        console.error('[Demo Seeder] Error during seed:', err);
        await mongoose_1.default.disconnect();
        process.exit(1);
    });
}
//# sourceMappingURL=demo-seed.js.map