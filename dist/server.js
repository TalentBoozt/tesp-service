"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./shared/infrastructure/database/database");
const auth_seeder_service_1 = require("./modules/auth/infrastructure/services/auth-seeder.service");
const consulting_firm_seeder_service_1 = require("./modules/consultant/infrastructure/services/consulting-firm-seeder.service");
async function bootstrap() {
    try {
        // 1. Initialize MongoDB connection
        await database_1.Database.connect();
        console.log('[TESP Monolith] Connected to MongoDB Atlas');
        // 2. Ensure default production auth accounts exist
        const authSeeder = new auth_seeder_service_1.AuthSeederService();
        await authSeeder.ensureDefaultUsersExist();
        console.log('[TESP Monolith] Production IAM accounts verified in MongoDB');
        // 3. Ensure default consulting partner firms exist
        const firmSeeder = new consulting_firm_seeder_service_1.ConsultingFirmSeederService();
        await firmSeeder.ensureDefaultFirmsExist();
        console.log('[TESP Monolith] Consulting firms verified in MongoDB');
        // 4. Start HTTP Server listener
        const app = (0, app_1.createApp)();
        app.listen(config_1.config.port, () => {
            console.log(`[TESP Monolith] Server listening on port ${config_1.config.port} (${config_1.config.nodeEnv})`);
        });
    }
    catch (err) {
        console.error('[TESP Monolith] Fatal error during bootstrap:', err);
        process.exit(1);
    }
}
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}
//# sourceMappingURL=server.js.map