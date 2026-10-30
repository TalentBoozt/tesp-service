"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const database_1 = require("./database");
const project_schema_1 = require("../../../modules/project-config/infrastructure/persistence/mongoose/project.schema");
const org_node_schema_1 = require("../../../modules/organization/infrastructure/persistence/mongoose/org-node.schema");
const employee_schema_1 = require("../../../modules/employee/infrastructure/persistence/mongoose/employee.schema");
const survey_schema_1 = require("../../../modules/survey/infrastructure/persistence/mongoose/survey.schema");
const campaign_schema_1 = require("../../../modules/survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
const action_plan_schema_1 = require("../../../modules/action-planning/infrastructure/persistence/mongoose/action-plan.schema");
const token_vault_schema_1 = require("../../../modules/survey-distribution/infrastructure/persistence/mongoose/token-vault.schema");
const consultant_models_1 = require("../../../modules/consultant/infrastructure/persistence/mongoose/consultant.models");
const notification_schema_1 = require("../../../modules/notification/infrastructure/persistence/mongoose/notification.schema");
const redis_token_repository_1 = require("../../../modules/survey-distribution/infrastructure/cache/redis-token.repository");
const user_schema_1 = require("../../../modules/auth/infrastructure/persistence/user.schema");
const auth_middleware_1 = require("../../presentation/middleware/auth.middleware");
const auth_seeder_service_1 = require("../../../modules/auth/infrastructure/services/auth-seeder.service");
const consulting_firm_seeder_service_1 = require("../../../modules/consultant/infrastructure/services/consulting-firm-seeder.service");
const bcrypt_hasher_service_1 = require("../../../modules/auth/infrastructure/services/bcrypt-hasher.service");
async function seedDatabase() {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
        const errorMsg = 'FATAL: Database seed script cannot be executed in production environment without explicit ALLOW_DESTRUCTIVE_SEED=true!';
        console.error(errorMsg);
        if (!process.env.VITEST) {
            process.exit(1);
        }
        throw new Error(errorMsg);
    }
    console.log('--- [TESP Database Seeder] Connecting to MongoDB Atlas... ---');
    await database_1.Database.connect();
    console.log('[TESP Seeder] Purging legacy test accounts and ensuring sole Super Admin...');
    await user_schema_1.UserModel.deleteMany({ email: { $nin: ['superadmin@talnova.com', 'superadmin@talnova.io'] } });
    console.log('[TESP Seeder] Seeding production verified IAM user accounts (Super Admin: superadmin@talnova.io / superadmin@talnova.com / Password@123!)...');
    const authSeeder = new auth_seeder_service_1.AuthSeederService();
    await authSeeder.seedDefaultUsers(true);
    console.log('[TESP Seeder] Super Admin seeded successfully.');
    console.log('[TESP Seeder] Seeding consulting partner firms & portfolio assignments...');
    const firmSeeder = new consulting_firm_seeder_service_1.ConsultingFirmSeederService();
    await firmSeeder.seedDefaultFirms(true);
    console.log('[TESP Seeder] Consulting firms seeded successfully.');
    console.log('[TESP Seeder] Seeding canonical multi-firm consultant accounts...');
    const hasher = new bcrypt_hasher_service_1.BcryptHasherService();
    const consultantPasswordHash = await hasher.hashPassword('Password@123!');
    const consultantUsers = [
        {
            userId: 'USR-CONSULTANT',
            email: 'consultant@daashglobal.com',
            passwordHash: consultantPasswordHash,
            firstName: 'Samantha',
            lastName: 'Perera',
            role: auth_middleware_1.UserRole.CONSULTANT,
            firmId: 'FIRM-DAASH-01',
            primaryProjectId: 'PRJ-99201',
            authorizedProjectIds: ['PRJ-99201', 'PRJ-NESTLE'],
            mustChangePassword: false,
            failedLoginAttempts: 0,
            isActive: true,
            isEmailVerified: true,
        },
        {
            userId: 'USR-CONSULTANT-01',
            email: 'advisory@daashglobal.com',
            passwordHash: consultantPasswordHash,
            firstName: 'Tanya',
            lastName: 'Jayawardena',
            role: auth_middleware_1.UserRole.CONSULTANT,
            firmId: 'FIRM-DAASH-01',
            primaryProjectId: 'PRJ-99201',
            authorizedProjectIds: ['PRJ-99201', 'PRJ-NESTLE'],
            mustChangePassword: false,
            failedLoginAttempts: 0,
            isActive: true,
            isEmailVerified: true,
        },
        {
            userId: 'USR-CONSULTANT-TALNOVA',
            email: 'advisory@talnova.io',
            passwordHash: consultantPasswordHash,
            firstName: 'Dinesh',
            lastName: 'Wickramasinghe',
            role: auth_middleware_1.UserRole.CONSULTANT,
            firmId: 'FIRM-TALNOVA-01',
            primaryProjectId: 'PRJ-APAC01',
            authorizedProjectIds: ['PRJ-APAC01', 'PRJ-99202'],
            mustChangePassword: false,
            failedLoginAttempts: 0,
            isActive: true,
            isEmailVerified: true,
        },
        {
            userId: 'USR-CONSULTANT-MCKINSEY',
            email: 'advisory@mckinsey.com',
            passwordHash: consultantPasswordHash,
            firstName: 'Elena',
            lastName: 'Rostova',
            role: auth_middleware_1.UserRole.CONSULTANT,
            firmId: 'FIRM-MCKINSEY-01',
            primaryProjectId: 'PRJ-APAC01',
            authorizedProjectIds: ['PRJ-APAC01'],
            mustChangePassword: false,
            failedLoginAttempts: 0,
            isActive: true,
            isEmailVerified: true,
        },
        {
            userId: 'USR-ORGADMIN',
            email: 'orgadmin@aitkenspence.com',
            passwordHash: consultantPasswordHash,
            firstName: 'Roshan',
            lastName: 'Fernando',
            role: auth_middleware_1.UserRole.ORG_ADMIN,
            primaryProjectId: 'PRJ-99201',
            authorizedProjectIds: ['PRJ-99201'],
            mustChangePassword: false,
            failedLoginAttempts: 0,
            isActive: true,
            isEmailVerified: true,
        },
    ];
    for (const cu of consultantUsers) {
        await user_schema_1.UserModel.findOneAndUpdate({ email: cu.email }, { $set: cu }, { upsert: true, new: true });
    }
    console.log('[TESP Seeder] Canonical multi-firm consultant and client accounts seeded.');
    const projectId = 'PRJ-99201'; // Aitken Spence PLC
    const apacProjectId = 'PRJ-APAC01'; // Dialog Axiata PLC
    const nestleProjectId = 'PRJ-NESTLE'; // Nestlé Lanka
    const allProjectIds = [projectId, apacProjectId, nestleProjectId];
    console.log(`[TESP Seeder] Purging existing seed data across all client workspaces (${allProjectIds.join(', ')})...`);
    await Promise.all([
        project_schema_1.ProjectModel.deleteMany({ projectId: { $in: allProjectIds } }),
        org_node_schema_1.OrgNodeModel.deleteMany({ projectId: { $in: allProjectIds } }),
        employee_schema_1.EmployeeModel.deleteMany({ projectId: { $in: allProjectIds } }),
        survey_schema_1.SurveyModel.deleteMany({ projectId: { $in: allProjectIds } }),
        campaign_schema_1.CampaignModel.deleteMany({ projectId: { $in: allProjectIds } }),
        action_plan_schema_1.ActionPlanModel.deleteMany({ projectId: { $in: allProjectIds } }),
        token_vault_schema_1.TokenVaultModel.deleteMany({ projectId: { $in: allProjectIds } }),
        notification_schema_1.NotificationModel.deleteMany({ projectId: { $in: allProjectIds } }),
        consultant_models_1.ClientEngagementModel.deleteMany({}),
        consultant_models_1.IndustryBenchmarkModel.deleteMany({}),
        consultant_models_1.ExecutiveWorkshopModel.deleteMany({}),
        consultant_models_1.AiSignoffModel.deleteMany({}),
    ]);
    console.log('[TESP Seeder] 1. Creating Enterprise Client Organizations under Daash Global Advisory Tenant...');
    // 1.1 Aitken Spence PLC (Conglomerate: Tourism, Maritime, Cargo)
    await project_schema_1.ProjectModel.create({
        projectId,
        name: 'Aitken Spence PLC',
        clientOrgName: 'Aitken Spence PLC',
        tenantId: 'TENANT-FIRM-DAASH-01',
        tenantName: 'Daash Global Advisory',
        consultantFirmId: 'FIRM-DAASH-01',
        status: 'ACTIVE',
        tier: 'ENTERPRISE',
        budgets: {
            monthlyResponseCap: 10000,
            responsesConsumed: 1420,
            aiTokenCap: 500000,
            aiTokensConsumed: 112400,
            maxEmployees: 2500,
            storageQuotaMb: 10240,
        },
        licenseExpiresAt: new Date(Date.now() + 365 * 86400000),
        branding: {
            companyName: 'Aitken Spence PLC',
            primaryColor: '#0157C8',
            secondaryColor: '#0A1317',
            logoUrl: 'https://tesp.talnova.io/assets/logo-aitkenspence.svg',
        },
        supportedLocales: ['en-US', 'si-LK', 'ta-LK'],
        defaultLocale: 'en-US',
        features: {
            aiAnalyticsEnabled: true,
            actionPlanningEnabled: true,
            kioskModeEnabled: true,
            smsDistributionEnabled: true,
        },
        customAttributeDefinitions: [
            { key: 'Department', displayName: 'Department', dataType: 'STRING' },
            { key: 'Location', displayName: 'Work Location', dataType: 'STRING' },
            { key: 'Tenure', displayName: 'Tenure Bracket', dataType: 'STRING' },
        ],
        aiConfig: {
            provider: 'GEMINI',
            modelName: 'gemini-1.5-pro',
            maxTokensPerAnalysis: 4000,
            monthlyTokenBudget: 1000000,
            currentMonthUsage: 112400,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        emailConfig: {
            provider: 'ZOHO_ZEPTOMAIL_CPAAS',
            fromName: 'Aitken Spence Engagement Team',
            fromEmail: 'surveys@aitkenspence.com',
            replyToEmail: 'advisory@daashglobal.com',
            zeptoMailApiKey: 'zoho_zeptomail_token_aitken_spence_cpaas_2026',
            zeptoMailRegion: 'US',
            dailySendLimit: 50000,
            isDomainVerified: true,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        version: 1,
    });
    // 1.2 Dialog Axiata PLC (Telecommunications, 5G, FinTech)
    await project_schema_1.ProjectModel.create({
        projectId: apacProjectId,
        name: 'Dialog Axiata PLC',
        clientOrgName: 'Dialog Axiata PLC',
        tenantId: 'TENANT-FIRM-TALNOVA-01',
        tenantName: 'Talnova Human Capital Advisory',
        consultantFirmId: 'FIRM-TALNOVA-01',
        status: 'ACTIVE',
        tier: 'ENTERPRISE',
        budgets: {
            monthlyResponseCap: 15000,
            responsesConsumed: 4890,
            aiTokenCap: 1000000,
            aiTokensConsumed: 245000,
            maxEmployees: 5000,
            storageQuotaMb: 20480,
        },
        licenseExpiresAt: new Date(Date.now() + 365 * 86400000),
        branding: {
            companyName: 'Dialog Axiata PLC',
            primaryColor: '#0D9488',
            secondaryColor: '#134E4A',
            logoUrl: 'https://tesp.talnova.io/assets/logo-dialog.svg',
        },
        supportedLocales: ['en-US', 'si-LK', 'ta-LK'],
        defaultLocale: 'en-US',
        features: {
            aiAnalyticsEnabled: true,
            actionPlanningEnabled: true,
            kioskModeEnabled: true,
            smsDistributionEnabled: true,
        },
        customAttributeDefinitions: [
            { key: 'Department', displayName: 'Department', dataType: 'STRING' },
            { key: 'Region', displayName: 'Regional Cluster', dataType: 'STRING' },
            { key: 'Band', displayName: 'Career Band', dataType: 'STRING' },
        ],
        aiConfig: {
            provider: 'OPENAI',
            modelName: 'gpt-4o',
            maxTokensPerAnalysis: 4000,
            monthlyTokenBudget: 1000000,
            currentMonthUsage: 245000,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        emailConfig: {
            provider: 'GOOGLE_WORKSPACE_SMTP',
            fromName: 'Dialog Axiata People & Culture',
            fromEmail: 'surveys@dialog.lk',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'surveys@dialog.lk',
            smtpPassword: 'dialog_google_app_password_2026',
            useTls: true,
            dailySendLimit: 500,
            isDomainVerified: true,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        version: 1,
    });
    // 1.3 Nestlé Lanka (FMCG Manufacturing, Supply Chain, Dairy Nutrition)
    await project_schema_1.ProjectModel.create({
        projectId: nestleProjectId,
        name: 'Nestlé Lanka',
        clientOrgName: 'Nestlé Lanka',
        tenantId: 'TENANT-FIRM-DAASH-01',
        tenantName: 'Daash Global Advisory',
        consultantFirmId: 'FIRM-DAASH-01',
        status: 'ACTIVE',
        tier: 'SCALE',
        budgets: {
            monthlyResponseCap: 5000,
            responsesConsumed: 850,
            aiTokenCap: 250000,
            aiTokensConsumed: 42000,
            maxEmployees: 1200,
            storageQuotaMb: 5120,
        },
        licenseExpiresAt: new Date(Date.now() + 180 * 86400000),
        branding: {
            companyName: 'Nestlé Lanka',
            primaryColor: '#4338CA',
            secondaryColor: '#1E1B4B',
            logoUrl: 'https://tesp.talnova.io/assets/logo-nestle.svg',
        },
        supportedLocales: ['en-US', 'si-LK'],
        defaultLocale: 'en-US',
        features: {
            aiAnalyticsEnabled: true,
            actionPlanningEnabled: true,
            kioskModeEnabled: true,
            smsDistributionEnabled: false,
        },
        customAttributeDefinitions: [
            { key: 'Department', displayName: 'Department', dataType: 'STRING' },
            { key: 'Facility', displayName: 'Manufacturing Facility', dataType: 'STRING' },
            { key: 'Shift', displayName: 'Shift Rotation', dataType: 'STRING' },
        ],
        aiConfig: {
            provider: 'GEMINI',
            modelName: 'gemini-1.5-pro',
            maxTokensPerAnalysis: 2000,
            monthlyTokenBudget: 250000,
            currentMonthUsage: 42000,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        emailConfig: {
            provider: 'ZOHO_SMTP',
            fromName: 'Nestlé Lanka HR Operations',
            fromEmail: 'feedback@lk.nestle.com',
            smtpHost: 'smtp.zoho.com',
            smtpPort: 465,
            smtpUser: 'feedback@lk.nestle.com',
            smtpPassword: 'nestle_zoho_app_password_2026',
            useTls: true,
            dailySendLimit: 1000,
            isDomainVerified: true,
            lastTestStatus: 'SUCCESS',
            lastTestTimestamp: new Date(),
        },
        version: 1,
    });
    console.log('[TESP Seeder] 2. Creating Complete Multi-Tenant Organizational Trees...');
    // 2.1 Aitken Spence Organization Hierarchy
    await org_node_schema_1.OrgNodeModel.insertMany([
        {
            projectId,
            nodeId: 'N-CORP-HQ',
            name: 'Aitken Spence Corporate HQ',
            type: 'COMPANY',
            parentId: null,
            path: ',N-CORP-HQ,',
            depth: 0,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 450, City: 'Colombo 02', Country: 'Sri Lanka' },
        },
        {
            projectId,
            nodeId: 'N-TOURISM-SECTOR',
            name: 'Tourism & Hospitality Sector',
            type: 'SECTOR',
            parentId: 'N-CORP-HQ',
            path: ',N-CORP-HQ,N-TOURISM-SECTOR,',
            depth: 1,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 1420, SectorLead: 'Roshan Fernando' },
        },
        {
            projectId,
            nodeId: 'N-MARITIME-SECTOR',
            name: 'Maritime & Freight Logistics Sector',
            type: 'SECTOR',
            parentId: 'N-CORP-HQ',
            path: ',N-CORP-HQ,N-MARITIME-SECTOR,',
            depth: 1,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 630, SectorLead: 'Dinesh Wickramasinghe' },
        },
        {
            projectId,
            nodeId: 'N-HOTELS-DIV',
            name: 'Heritance & Adaaran Hotels',
            type: 'DEPARTMENT',
            parentId: 'N-TOURISM-SECTOR',
            path: ',N-CORP-HQ,N-TOURISM-SECTOR,N-HOTELS-DIV,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 850, Brand: 'Luxury Hospitality' },
        },
        {
            projectId,
            nodeId: 'N-TRAVELS-DIV',
            name: 'Aitken Spence Travels & Inbound',
            type: 'DEPARTMENT',
            parentId: 'N-TOURISM-SECTOR',
            path: ',N-CORP-HQ,N-TOURISM-SECTOR,N-TRAVELS-DIV,',
            depth: 2,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 240, Focus: 'Inbound Tourism DMC' },
        },
        {
            projectId,
            nodeId: 'N-CARGO-DIV',
            name: 'Global Freight & Cargo Solutions',
            type: 'DEPARTMENT',
            parentId: 'N-MARITIME-SECTOR',
            path: ',N-CORP-HQ,N-MARITIME-SECTOR,N-CARGO-DIV,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 310, Hub: 'Port of Colombo' },
        },
        {
            projectId,
            nodeId: 'N-COLOMBO-OPS',
            name: 'Colombo Port Operations',
            type: 'TEAM',
            parentId: 'N-CARGO-DIV',
            path: ',N-CORP-HQ,N-MARITIME-SECTOR,N-CARGO-DIV,N-COLOMBO-OPS,',
            depth: 3,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 95, ShiftWork: true },
        },
        {
            projectId,
            nodeId: 'N-RESORT-OPS',
            name: 'Resort Operations Team',
            type: 'TEAM',
            parentId: 'N-HOTELS-DIV',
            path: ',N-CORP-HQ,N-TOURISM-SECTOR,N-HOTELS-DIV,N-RESORT-OPS,',
            depth: 3,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 140, Regions: 'Southern Coast & Maldives' },
        },
    ]);
    // 2.2 Dialog Axiata Organization Hierarchy
    await org_node_schema_1.OrgNodeModel.insertMany([
        {
            projectId: apacProjectId,
            nodeId: 'N-DIALOG-HQ',
            name: 'Dialog Axiata Corporate HQ',
            type: 'COMPANY',
            parentId: null,
            path: ',N-DIALOG-HQ,',
            depth: 0,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 1100, City: 'Colombo 02', Country: 'Sri Lanka' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-TELCO-SECTOR',
            name: 'Telecommunications & Network Infrastructure',
            type: 'SECTOR',
            parentId: 'N-DIALOG-HQ',
            path: ',N-DIALOG-HQ,N-TELCO-SECTOR,',
            depth: 1,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 2200, SectorLead: 'Lasantha Theverapperuma' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-DIGITAL-SECTOR',
            name: 'Digital Services & FinTech Solutions',
            type: 'SECTOR',
            parentId: 'N-DIALOG-HQ',
            path: ',N-DIALOG-HQ,N-DIGITAL-SECTOR,',
            depth: 1,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 950, SectorLead: 'Renuka Fernando' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-5G-NETWORKS',
            name: 'Core 5G Network Operations',
            type: 'DEPARTMENT',
            parentId: 'N-TELCO-SECTOR',
            path: ',N-DIALOG-HQ,N-TELCO-SECTOR,N-5G-NETWORKS,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 480, Domain: '5G Core, RAN & Microwave' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-EZCASH-FINTECH',
            name: 'FinTech, Payments & Mobile Commerce',
            type: 'DEPARTMENT',
            parentId: 'N-DIGITAL-SECTOR',
            path: ',N-DIALOG-HQ,N-DIGITAL-SECTOR,N-EZCASH-FINTECH,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 260, Product: 'eZ Cash & Genie' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-OMNICHANNEL-CARE',
            name: 'Omnichannel Customer Experience',
            type: 'DEPARTMENT',
            parentId: 'N-TELCO-SECTOR',
            path: ',N-DIALOG-HQ,N-TELCO-SECTOR,N-OMNICHANNEL-CARE,',
            depth: 2,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 720, Channels: 'Contact Center, Digital Bot & Retail' },
        },
        {
            projectId: apacProjectId,
            nodeId: 'N-CLOUD-INFRA',
            name: 'Cloud Infrastructure & SRE Team',
            type: 'TEAM',
            parentId: 'N-5G-NETWORKS',
            path: ',N-DIALOG-HQ,N-TELCO-SECTOR,N-5G-NETWORKS,N-CLOUD-INFRA,',
            depth: 3,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 85, Tech: 'Kubernetes, AWS, Hybrid Cloud' },
        },
    ]);
    // 2.3 Nestlé Lanka Organization Hierarchy
    await org_node_schema_1.OrgNodeModel.insertMany([
        {
            projectId: nestleProjectId,
            nodeId: 'N-NESTLE-HQ',
            name: 'Nestlé Lanka Corporate Office',
            type: 'COMPANY',
            parentId: null,
            path: ',N-NESTLE-HQ,',
            depth: 0,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 280, Location: 'Colombo 04', Country: 'Sri Lanka' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-SUPPLY-CHAIN',
            name: 'Supply Chain & Technical Manufacturing',
            type: 'SECTOR',
            parentId: 'N-NESTLE-HQ',
            path: ',N-NESTLE-HQ,N-SUPPLY-CHAIN,',
            depth: 1,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 650, Lead: 'Samantha Gunasekara' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-COMMERCIAL-DIV',
            name: 'Commercial Brands, Nutrition & Marketing',
            type: 'SECTOR',
            parentId: 'N-NESTLE-HQ',
            path: ',N-NESTLE-HQ,N-COMMERCIAL-DIV,',
            depth: 1,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 270, Lead: 'Ruwan Welikala' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-PANNALA-FACTORY',
            name: 'Pannala Manufacturing Plant',
            type: 'DEPARTMENT',
            parentId: 'N-SUPPLY-CHAIN',
            path: ',N-NESTLE-HQ,N-SUPPLY-CHAIN,N-PANNALA-FACTORY,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 420, FacilityType: 'Automated Processing Plant' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-QUALITY-ASSURANCE',
            name: 'Quality Assurance & Food Safety',
            type: 'DEPARTMENT',
            parentId: 'N-SUPPLY-CHAIN',
            path: ',N-NESTLE-HQ,N-SUPPLY-CHAIN,N-QUALITY-ASSURANCE,',
            depth: 2,
            displayOrder: 2,
            status: 'ACTIVE',
            attributes: { Headcount: 75, Standards: 'ISO 22000, FSSC' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-DAIRY-BEVERAGES',
            name: 'Dairy, Malt Beverages & Infant Nutrition',
            type: 'DEPARTMENT',
            parentId: 'N-COMMERCIAL-DIV',
            path: ',N-NESTLE-HQ,N-COMMERCIAL-DIV,N-DAIRY-BEVERAGES,',
            depth: 2,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 110, Brands: 'Milo, Nespray, Lactogrow' },
        },
        {
            projectId: nestleProjectId,
            nodeId: 'N-PACKAGING-LINE',
            name: 'Continuous Improvement & Packaging Line',
            type: 'TEAM',
            parentId: 'N-PANNALA-FACTORY',
            path: ',N-NESTLE-HQ,N-SUPPLY-CHAIN,N-PANNALA-FACTORY,N-PACKAGING-LINE,',
            depth: 3,
            displayOrder: 1,
            status: 'ACTIVE',
            attributes: { Headcount: 160, Shifts: 3, LeanSixSigma: true },
        },
    ]);
    console.log('[TESP Seeder] 3. Creating Realistic Employee Directories across Workspaces...');
    // 3.1 Aitken Spence Employees
    await employee_schema_1.EmployeeModel.insertMany([
        {
            projectId,
            employeeId: 'EMP-ASP-001',
            nodeId: 'N-CORP-HQ',
            email: 'p.dissanayake@aitkenspence.lk',
            fullName: 'Dr. Parakrama Dissanayake',
            phoneNumber: '+94-11-230-8000',
            status: 'ACTIVE',
            attributes: { Department: 'Executive Board', Location: 'Vauxhall St, Colombo', Tenure: '5+ Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-101',
            nodeId: 'N-HOTELS-DIV',
            email: 'roshan.fernando@aitkenspence.lk',
            fullName: 'Roshan Fernando',
            phoneNumber: '+94-77-123-4501',
            status: 'ACTIVE',
            attributes: { Department: 'Heritance Hotels', Location: 'Ahungalla', Tenure: '3-5 Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-102',
            nodeId: 'N-TRAVELS-DIV',
            email: 'dilani.weerasinghe@aitkenspence.lk',
            fullName: 'Dilani Weerasinghe',
            phoneNumber: '+94-77-123-4502',
            status: 'ACTIVE',
            attributes: { Department: 'Inbound Travels', Location: 'Colombo', Tenure: '1-3 Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-103',
            nodeId: 'N-CARGO-DIV',
            email: 'chathura.silva@aitkenspence.lk',
            fullName: 'Chathura Silva',
            phoneNumber: '+94-77-123-4503',
            status: 'ACTIVE',
            attributes: { Department: 'Maritime Cargo', Location: 'Colombo Port', Tenure: '5+ Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-104',
            nodeId: 'N-COLOMBO-OPS',
            email: 'keshani.senanayake@aitkenspence.lk',
            fullName: 'Keshani Senanayake',
            phoneNumber: '+94-77-123-4504',
            status: 'ACTIVE',
            attributes: { Department: 'Port Operations', Location: 'Colombo Port', Tenure: '1-3 Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-105',
            nodeId: 'N-RESORT-OPS',
            email: 'farhan.nazeer@aitkenspence.lk',
            fullName: 'Farhan Nazeer',
            phoneNumber: '+960-779-1234',
            status: 'ACTIVE',
            attributes: { Department: 'Resort Operations', Location: 'Maldives', Tenure: '< 1 Year' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-106',
            nodeId: 'N-TOURISM-SECTOR',
            email: 'anoma.rathnayake@aitkenspence.lk',
            fullName: 'Anoma Rathnayake',
            phoneNumber: '+94-77-123-4506',
            status: 'ACTIVE',
            attributes: { Department: 'Tourism Leadership', Location: 'Colombo', Tenure: '5+ Years' },
        },
        {
            projectId,
            employeeId: 'EMP-ASP-107',
            nodeId: 'N-MARITIME-SECTOR',
            email: 'dinesh.wick@aitkenspence.lk',
            fullName: 'Dinesh Wickramasinghe',
            phoneNumber: '+94-77-123-4507',
            status: 'ACTIVE',
            attributes: { Department: 'Maritime Logistics', Location: 'Colombo', Tenure: '3-5 Years' },
        },
    ]);
    // 3.2 Dialog Axiata Employees
    await employee_schema_1.EmployeeModel.insertMany([
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-001',
            nodeId: 'N-DIALOG-HQ',
            email: 'supun.weerasinghe@dialog.lk',
            fullName: 'Supun Weerasinghe',
            phoneNumber: '+94-77-767-8700',
            status: 'ACTIVE',
            attributes: { Department: 'Group Executive', Region: 'Colombo HQ', Band: 'Band 1' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-101',
            nodeId: 'N-5G-NETWORKS',
            email: 'lasantha.t@dialog.lk',
            fullName: 'Lasantha Theverapperuma',
            phoneNumber: '+94-77-767-8701',
            status: 'ACTIVE',
            attributes: { Department: '5G Core Network', Region: 'Colombo', Band: 'Band 2' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-102',
            nodeId: 'N-OMNICHANNEL-CARE',
            email: 'sandra.dz@dialog.lk',
            fullName: 'Sandra De Zoysa',
            phoneNumber: '+94-77-767-8702',
            status: 'ACTIVE',
            attributes: { Department: 'Customer Experience', Region: 'Colombo', Band: 'Band 2' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-103',
            nodeId: 'N-EZCASH-FINTECH',
            email: 'renuka.f@dialog.lk',
            fullName: 'Renuka Fernando',
            phoneNumber: '+94-77-767-8703',
            status: 'ACTIVE',
            attributes: { Department: 'Digital FinTech', Region: 'Colombo', Band: 'Band 2' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-104',
            nodeId: 'N-CLOUD-INFRA',
            email: 'tharindu.j@dialog.lk',
            fullName: 'Tharindu Jayawardena',
            phoneNumber: '+94-77-767-8704',
            status: 'ACTIVE',
            attributes: { Department: 'Cloud SRE', Region: 'Colombo', Band: 'Band 3' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-105',
            nodeId: 'N-5G-NETWORKS',
            email: 'minoli.p@dialog.lk',
            fullName: 'Minoli Perera',
            phoneNumber: '+94-77-767-8705',
            status: 'ACTIVE',
            attributes: { Department: 'RAN Operations', Region: 'Kandy Cluster', Band: 'Band 3' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-106',
            nodeId: 'N-EZCASH-FINTECH',
            email: 'nuwan.b@dialog.lk',
            fullName: 'Nuwan Bandara',
            phoneNumber: '+94-77-767-8706',
            status: 'ACTIVE',
            attributes: { Department: 'Mobile Money Systems', Region: 'Colombo', Band: 'Band 3' },
        },
        {
            projectId: apacProjectId,
            employeeId: 'EMP-DIA-107',
            nodeId: 'N-TELCO-SECTOR',
            email: 'chaminda.r@dialog.lk',
            fullName: 'Chaminda Ratnayake',
            phoneNumber: '+94-77-767-8707',
            status: 'ACTIVE',
            attributes: { Department: 'Network Architecture', Region: 'Southern Cluster', Band: 'Band 2' },
        },
    ]);
    // 3.3 Nestlé Lanka Employees
    await employee_schema_1.EmployeeModel.insertMany([
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-001',
            nodeId: 'N-NESTLE-HQ',
            email: 'bernie.stefan@nestle.com',
            fullName: 'Bernie Stefan',
            phoneNumber: '+94-11-269-9991',
            status: 'ACTIVE',
            attributes: { Department: 'Managing Director Office', Facility: 'Colombo HQ', Shift: 'General' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-101',
            nodeId: 'N-PANNALA-FACTORY',
            email: 'raditha.s@nestle.com',
            fullName: 'Raditha Samarasinghe',
            phoneNumber: '+94-37-228-8801',
            status: 'ACTIVE',
            attributes: { Department: 'Factory Operations', Facility: 'Pannala Factory', Shift: 'Shift A' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-102',
            nodeId: 'N-COMMERCIAL-DIV',
            email: 'ruwan.w@nestle.com',
            fullName: 'Ruwan Welikala',
            phoneNumber: '+94-11-269-9992',
            status: 'ACTIVE',
            attributes: { Department: 'Commercial Nutrition', Facility: 'Colombo HQ', Shift: 'General' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-103',
            nodeId: 'N-QUALITY-ASSURANCE',
            email: 'damitha.b@nestle.com',
            fullName: 'Damitha Bandara',
            phoneNumber: '+94-37-228-8803',
            status: 'ACTIVE',
            attributes: { Department: 'Food Safety QA', Facility: 'Pannala Factory', Shift: 'Shift B' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-104',
            nodeId: 'N-PACKAGING-LINE',
            email: 'nilanthi.j@nestle.com',
            fullName: 'Nilanthi Jayatillake',
            phoneNumber: '+94-37-228-8804',
            status: 'ACTIVE',
            attributes: { Department: 'Packaging Line', Facility: 'Pannala Factory', Shift: 'Shift A' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-105',
            nodeId: 'N-DAIRY-BEVERAGES',
            email: 'kasun.w@nestle.com',
            fullName: 'Kasun Wickramaratne',
            phoneNumber: '+94-11-269-9995',
            status: 'ACTIVE',
            attributes: { Department: 'Dairy Brands', Facility: 'Colombo HQ', Shift: 'General' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-106',
            nodeId: 'N-SUPPLY-CHAIN',
            email: 'samantha.g@nestle.com',
            fullName: 'Samantha Gunasekara',
            phoneNumber: '+94-11-269-9996',
            status: 'ACTIVE',
            attributes: { Department: 'Logistics & Warehousing', Facility: 'Kurunegala Hub', Shift: 'General' },
        },
        {
            projectId: nestleProjectId,
            employeeId: 'EMP-NES-107',
            nodeId: 'N-PANNALA-FACTORY',
            email: 'thilini.a@nestle.com',
            fullName: 'Thilini Abeywardena',
            phoneNumber: '+94-37-228-8807',
            status: 'ACTIVE',
            attributes: { Department: 'Automation Engineering', Facility: 'Pannala Factory', Shift: 'Shift C' },
        },
    ]);
    console.log('[TESP Seeder] 4. Creating Published Surveys across Workspaces...');
    // 4.1 Aitken Spence Survey
    await survey_schema_1.SurveyModel.create({
        projectId,
        surveyId: 'SRV-ENG-2026',
        version: 1,
        title: {
            'en-US': '2026 Aitken Spence Enterprise Engagement Survey',
            'si-LK': '2026 එයිට්කින් ස්පෙන්ස් ආයතනික කාර්ය මණ්ඩල සමීක්ෂණය',
            'ta-LK': '2026 எய்ட்கின் ஸ்பென்ஸ் நிறுவன பணியாளர் ஈடுபாடு கணக்கெடுப்பு',
        },
        description: {
            'en-US': 'Annual confidential survey measuring team autonomy, psychological safety, leadership alignment, and innovation culture.',
        },
        status: 'PUBLISHED',
        publishedAt: new Date(),
        pages: [
            {
                pageId: 'P-1',
                title: { 'en-US': 'Workplace Experience & Team Culture' },
                pageOrder: 1,
                sections: [
                    {
                        sectionId: 'SEC-1',
                        title: { 'en-US': 'Core Engagement Dimensions' },
                        sectionOrder: 1,
                        questions: [
                            {
                                questionId: 'Q-101',
                                type: 'LIKERT',
                                groupId: 'PSYCHOLOGICAL_SAFETY',
                                prompt: { 'en-US': 'I feel safe taking calculated risks and expressing candid opinions on my team without fear of retaliation.' },
                                isMandatory: true,
                                options: [
                                    { optionId: 'OPT-1', label: { 'en-US': 'Strongly Disagree' }, scoreValue: 1 },
                                    { optionId: 'OPT-2', label: { 'en-US': 'Disagree' }, scoreValue: 2 },
                                    { optionId: 'OPT-3', label: { 'en-US': 'Neutral' }, scoreValue: 3 },
                                    { optionId: 'OPT-4', label: { 'en-US': 'Agree' }, scoreValue: 4 },
                                    { optionId: 'OPT-5', label: { 'en-US': 'Strongly Agree' }, scoreValue: 5 },
                                ],
                            },
                            {
                                questionId: 'Q-102',
                                type: 'LIKERT',
                                groupId: 'MANAGEMENT_ALIGNMENT',
                                prompt: { 'en-US': 'My department director provides transparent feedback and sets achievable milestones.' },
                                isMandatory: true,
                                options: [
                                    { optionId: 'OPT-1', label: { 'en-US': 'Strongly Disagree' }, scoreValue: 1 },
                                    { optionId: 'OPT-2', label: { 'en-US': 'Disagree' }, scoreValue: 2 },
                                    { optionId: 'OPT-3', label: { 'en-US': 'Neutral' }, scoreValue: 3 },
                                    { optionId: 'OPT-4', label: { 'en-US': 'Agree' }, scoreValue: 4 },
                                    { optionId: 'OPT-5', label: { 'en-US': 'Strongly Agree' }, scoreValue: 5 },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                pageId: 'P-2',
                title: { 'en-US': 'Net Promoter & Organizational Trust' },
                pageOrder: 2,
                sections: [
                    {
                        sectionId: 'SEC-2',
                        title: { 'en-US': 'Advocacy & eNPS' },
                        sectionOrder: 1,
                        questions: [
                            {
                                questionId: 'Q-201',
                                type: 'NPS',
                                groupId: 'ORGANIZATIONAL_ENPS',
                                prompt: { 'en-US': 'How likely are you to recommend Aitken Spence as an employer of choice to colleagues?' },
                                isMandatory: true,
                            },
                        ],
                    },
                ],
            },
            {
                pageId: 'P-3',
                title: { 'en-US': 'Qualitative Voice & Leadership Feedback' },
                pageOrder: 3,
                sections: [
                    {
                        sectionId: 'SEC-3',
                        title: { 'en-US': 'Open-Ended Insights' },
                        sectionOrder: 1,
                        questions: [
                            {
                                questionId: 'Q-301',
                                type: 'LONG_TEXT',
                                groupId: 'QUALITATIVE_VOICE',
                                prompt: { 'en-US': 'What is the single most impactful initiative leadership can undertake to support front-line operations?' },
                                isMandatory: false,
                            },
                        ],
                    },
                ],
            },
        ],
        versionHistory: [{ version: 1, publishedAt: new Date(), publishedBy: 'USR-ADMIN' }],
    });
    // 4.2 Dialog Axiata Survey
    await survey_schema_1.SurveyModel.create({
        projectId: apacProjectId,
        surveyId: 'SRV-DIALOG-2026',
        version: 1,
        title: {
            'en-US': '2026 Dialog Axiata Leadership & Digital Agility Survey',
            'si-LK': '2026 ඩයලොග් නායකත්ව සහ ඩිජිටල් කාර්යක්ෂමතා සමීක්ෂණය',
            'ta-LK': '2026 டயலொக் தலைமைத்துவம் மற்றும் டிஜிட்டல் சுறுசுறுப்பு கணக்கெடுப்பு',
        },
        description: {
            'en-US': 'Diagnostic assessment of agile delivery speed, engineering psychological safety, and cross-functional customer obsession.',
        },
        status: 'PUBLISHED',
        publishedAt: new Date(),
        pages: [
            {
                pageId: 'P-1',
                title: { 'en-US': 'Engineering Agility & DevOps Culture' },
                pageOrder: 1,
                sections: [
                    {
                        sectionId: 'SEC-1',
                        title: { 'en-US': 'Agile Autonomy & Tooling' },
                        sectionOrder: 1,
                        questions: [
                            {
                                questionId: 'Q-DIA-101',
                                type: 'LIKERT',
                                groupId: 'PSYCHOLOGICAL_SAFETY',
                                prompt: { 'en-US': 'Our deployment pipelines and blameless post-mortem culture empower us to innovate fearlessly.' },
                                isMandatory: true,
                                options: [
                                    { optionId: 'OPT-1', label: { 'en-US': 'Strongly Disagree' }, scoreValue: 1 },
                                    { optionId: 'OPT-2', label: { 'en-US': 'Disagree' }, scoreValue: 2 },
                                    { optionId: 'OPT-3', label: { 'en-US': 'Neutral' }, scoreValue: 3 },
                                    { optionId: 'OPT-4', label: { 'en-US': 'Agree' }, scoreValue: 4 },
                                    { optionId: 'OPT-5', label: { 'en-US': 'Strongly Agree' }, scoreValue: 5 },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                pageId: 'P-2',
                title: { 'en-US': 'Net Promoter Score' },
                pageOrder: 2,
                sections: [
                    {
                        sectionId: 'SEC-2',
                        title: { 'en-US': 'Advocacy' },
                        questions: [
                            {
                                questionId: 'Q-DIA-201',
                                type: 'NPS',
                                groupId: 'ORGANIZATIONAL_ENPS',
                                prompt: { 'en-US': 'How likely are you to recommend Dialog Axiata as a premier tech employer?' },
                                isMandatory: true,
                            },
                        ],
                    },
                ],
            },
        ],
        versionHistory: [{ version: 1, publishedAt: new Date(), publishedBy: 'USR-ADMIN' }],
    });
    // 4.3 Nestlé Lanka Survey
    await survey_schema_1.SurveyModel.create({
        projectId: nestleProjectId,
        surveyId: 'SRV-NESTLE-2026',
        version: 1,
        title: {
            'en-US': '2026 Nestlé Lanka Safety & Operational Excellence Diagnostic',
            'si-LK': '2026 නෙස්ලේ ලංකා සේවා ස්ථාන ආරක්ෂණ සහ මෙහෙයුම් විශිෂ්ටතා සමීක්ෂණය',
        },
        description: {
            'en-US': 'Factory floor psychological safety, near-miss reporting culture, physical ergonomics, and shift rotation feedback.',
        },
        status: 'PUBLISHED',
        publishedAt: new Date(),
        pages: [
            {
                pageId: 'P-1',
                title: { 'en-US': 'Plant Floor Health & Safety' },
                pageOrder: 1,
                sections: [
                    {
                        sectionId: 'SEC-1',
                        title: { 'en-US': 'Safety & Incident Reporting' },
                        questions: [
                            {
                                questionId: 'Q-NES-101',
                                type: 'LIKERT',
                                groupId: 'SAFETY_COMPLIANCE',
                                prompt: { 'en-US': 'I feel fully supported to stop an active production line if I observe a potential safety or quality hazard.' },
                                isMandatory: true,
                                options: [
                                    { optionId: 'OPT-1', label: { 'en-US': 'Strongly Disagree' }, scoreValue: 1 },
                                    { optionId: 'OPT-2', label: { 'en-US': 'Disagree' }, scoreValue: 2 },
                                    { optionId: 'OPT-3', label: { 'en-US': 'Neutral' }, scoreValue: 3 },
                                    { optionId: 'OPT-4', label: { 'en-US': 'Agree' }, scoreValue: 4 },
                                    { optionId: 'OPT-5', label: { 'en-US': 'Strongly Agree' }, scoreValue: 5 },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                pageId: 'P-2',
                title: { 'en-US': 'eNPS & Culture' },
                pageOrder: 2,
                sections: [
                    {
                        sectionId: 'SEC-2',
                        title: { 'en-US': 'eNPS' },
                        questions: [
                            {
                                questionId: 'Q-NES-201',
                                type: 'NPS',
                                groupId: 'ORGANIZATIONAL_ENPS',
                                prompt: { 'en-US': 'How likely are you to recommend Nestlé Lanka as a high-trust manufacturing workplace?' },
                                isMandatory: true,
                            },
                        ],
                    },
                ],
            },
        ],
        versionHistory: [{ version: 1, publishedAt: new Date(), publishedBy: 'USR-ADMIN' }],
    });
    console.log('[TESP Seeder] 5. Creating Survey Campaigns across Workspaces...');
    // 5.1 Aitken Spence Campaign
    await campaign_schema_1.CampaignModel.create({
        projectId,
        campaignId: 'CMP-1001',
        surveyId: 'SRV-ENG-2026',
        surveyVersion: 1,
        title: '2026 Aitken Spence Annual Pulse Campaign',
        anonymityLevel: 'SEMI_ANONYMOUS',
        channels: ['EMAIL', 'SMS', 'KIOSK_PIN', 'QR_CODE'],
        targetAudience: {
            nodeIds: ['N-TOURISM-SECTOR', 'N-MARITIME-SECTOR'],
        },
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 86400000),
        metrics: {
            totalTargeted: 500,
            sent: 480,
            delivered: 472,
            opened: 390,
            started: 320,
            completed: 284,
            bounced: 8,
        },
        status: 'ACTIVE',
    });
    // 5.2 Dialog Axiata Campaign
    await campaign_schema_1.CampaignModel.create({
        projectId: apacProjectId,
        campaignId: 'CMP-DIA-01',
        surveyId: 'SRV-DIALOG-2026',
        surveyVersion: 1,
        title: 'Dialog Axiata Q1 Network & Agility Pulse',
        anonymityLevel: 'SEMI_ANONYMOUS',
        channels: ['EMAIL', 'SMS', 'KIOSK_PIN', 'QR_CODE'],
        targetAudience: {
            nodeIds: ['N-TELCO-SECTOR', 'N-DIGITAL-SECTOR'],
        },
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 86400000),
        metrics: {
            totalTargeted: 1200,
            sent: 1180,
            delivered: 1165,
            opened: 980,
            started: 890,
            completed: 812,
            bounced: 15,
        },
        status: 'ACTIVE',
    });
    // 5.3 Nestlé Lanka Campaign
    await campaign_schema_1.CampaignModel.create({
        projectId: nestleProjectId,
        campaignId: 'CMP-NES-01',
        surveyId: 'SRV-NESTLE-2026',
        surveyVersion: 1,
        title: 'Pannala Plant Safety & Culture Engagement Pulse',
        anonymityLevel: 'SEMI_ANONYMOUS',
        channels: ['EMAIL', 'KIOSK_PIN', 'QR_CODE'],
        targetAudience: {
            nodeIds: ['N-SUPPLY-CHAIN', 'N-COMMERCIAL-DIV'],
        },
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 86400000),
        metrics: {
            totalTargeted: 600,
            sent: 570,
            delivered: 565,
            opened: 480,
            started: 410,
            completed: 395,
            bounced: 5,
        },
        status: 'ACTIVE',
    });
    console.log('[TESP Seeder] 6. Creating Closed-Loop Action Plans across Workspaces...');
    // 6.1 Aitken Spence Action Plan
    await action_plan_schema_1.ActionPlanModel.create({
        projectId,
        actionPlanId: 'ACT-ASP-001',
        campaignId: 'CMP-1001',
        nodeId: 'N-HOTELS-DIV',
        groupId: 'PSYCHOLOGICAL_SAFETY',
        title: 'Hospitality Frontline Mentorship & Safety Initiative',
        description: 'Implement peer review circles and guest feedback listening sessions to build resilience and staff autonomy across resorts.',
        status: 'IN_PROGRESS',
        assigneeId: 'EMP-ASP-101',
        approverId: 'EMP-ASP-001',
        baselineScore: 68,
        targetScore: 85,
        targetCompletionDate: new Date(Date.now() + 60 * 86400000),
        milestones: [
            {
                milestoneId: 'M-1',
                title: 'Establish supervisor mentorship pairing across resort clusters',
                status: 'COMPLETED',
                dueDate: new Date(Date.now() - 7 * 86400000),
            },
            {
                milestoneId: 'M-2',
                title: 'Conduct weekly frontline town halls without middle management filtering',
                status: 'IN_PROGRESS',
                dueDate: new Date(Date.now() + 14 * 86400000),
            },
        ],
    });
    // 6.2 Dialog Axiata Action Plan
    await action_plan_schema_1.ActionPlanModel.create({
        projectId: apacProjectId,
        actionPlanId: 'ACT-DIA-001',
        campaignId: 'CMP-DIA-01',
        nodeId: 'N-5G-NETWORKS',
        groupId: 'PSYCHOLOGICAL_SAFETY',
        title: '5G Core DevOps On-Call Resilience & SRE Automation',
        description: 'Deploy blameless post-mortem tooling and automate level-1 paging runbooks to alleviate engineering alert fatigue.',
        status: 'IN_PROGRESS',
        assigneeId: 'EMP-DIA-101',
        approverId: 'EMP-DIA-001',
        baselineScore: 72,
        targetScore: 90,
        targetCompletionDate: new Date(Date.now() + 45 * 86400000),
        milestones: [
            {
                milestoneId: 'M-1',
                title: 'Implement automated incident runbook self-healing',
                status: 'COMPLETED',
                dueDate: new Date(Date.now() - 5 * 86400000),
            },
            {
                milestoneId: 'M-2',
                title: 'Cap weekly on-call shifts to a maximum of 4 consecutive days',
                status: 'IN_PROGRESS',
                dueDate: new Date(Date.now() + 20 * 86400000),
            },
        ],
    });
    // 6.3 Nestlé Lanka Action Plan
    await action_plan_schema_1.ActionPlanModel.create({
        projectId: nestleProjectId,
        actionPlanId: 'ACT-NES-001',
        campaignId: 'CMP-NES-01',
        nodeId: 'N-PANNALA-FACTORY',
        groupId: 'SAFETY_COMPLIANCE',
        title: 'Pannala Factory Shift Safety Protocols & Ergonomics Program',
        description: 'Upgrade packaging line safety barriers and introduce ergonomic shift rotation intervals to prevent musculoskeletal fatigue.',
        status: 'IN_PROGRESS',
        assigneeId: 'EMP-NES-101',
        approverId: 'EMP-NES-001',
        baselineScore: 70,
        targetScore: 92,
        targetCompletionDate: new Date(Date.now() + 90 * 86400000),
        milestones: [
            {
                milestoneId: 'M-1',
                title: 'Conduct ergonomic assessment of high-speed packaging stations',
                status: 'COMPLETED',
                dueDate: new Date(Date.now() - 10 * 86400000),
            },
            {
                milestoneId: 'M-2',
                title: 'Deploy QR-code physical incident and near-miss reporting kiosks',
                status: 'IN_PROGRESS',
                dueDate: new Date(Date.now() + 30 * 86400000),
            },
        ],
    });
    console.log('[TESP Seeder] 7. Caching and Persisting Test Survey Tokens across Workspaces...');
    await token_vault_schema_1.TokenVaultModel.insertMany([
        // Aitken Spence Tokens
        {
            projectId,
            campaignId: 'CMP-1001',
            token: 'TKN-DEMO-2026',
            nodeId: 'N-HOTELS-DIV',
            employeeId: 'EMP-ASP-101',
            isBurned: false,
        },
        {
            projectId,
            campaignId: 'CMP-1001',
            token: 'TKN-KIOSK-2026',
            nodeId: 'N-COLOMBO-OPS',
            employeeId: 'EMP-ASP-104',
            isBurned: false,
        },
        // Dialog Axiata Tokens
        {
            projectId: apacProjectId,
            campaignId: 'CMP-DIA-01',
            token: 'TKN-DIALOG-2026',
            nodeId: 'N-5G-NETWORKS',
            employeeId: 'EMP-DIA-101',
            isBurned: false,
        },
        {
            projectId: apacProjectId,
            campaignId: 'CMP-DIA-01',
            token: 'TKN-DIA-KIOSK',
            nodeId: 'N-CLOUD-INFRA',
            employeeId: 'EMP-DIA-104',
            isBurned: false,
        },
        // Nestlé Lanka Tokens
        {
            projectId: nestleProjectId,
            campaignId: 'CMP-NES-01',
            token: 'TKN-NESTLE-2026',
            nodeId: 'N-PANNALA-FACTORY',
            employeeId: 'EMP-NES-101',
            isBurned: false,
        },
        {
            projectId: nestleProjectId,
            campaignId: 'CMP-NES-01',
            token: 'TKN-NES-KIOSK',
            nodeId: 'N-PACKAGING-LINE',
            employeeId: 'EMP-NES-104',
            isBurned: false,
        },
    ]);
    console.log('[TESP Seeder] 8. Seeding Daash Global Industry Benchmarks...');
    await consultant_models_1.IndustryBenchmarkModel.insertMany([
        {
            metricKey: 'ENPS',
            metricName: 'Employee Net Promoter Score (eNPS)',
            sector: 'GLOBAL_TECH',
            p25Score: 18.0,
            p50MedianScore: 38.0,
            p90TopDecileScore: 64.0,
        },
        {
            metricKey: 'CAREER_GROWTH',
            metricName: 'Career Progression & Learning Opportunity',
            sector: 'GLOBAL_TECH',
            p25Score: 58.0,
            p50MedianScore: 71.5,
            p90TopDecileScore: 88.0,
        },
        {
            metricKey: 'LEADERSHIP_TRUST',
            metricName: 'Strategic Leadership & Executive Transparency',
            sector: 'GLOBAL_TECH',
            p25Score: 62.0,
            p50MedianScore: 74.0,
            p90TopDecileScore: 91.5,
        },
        {
            metricKey: 'SAFETY_COMPLIANCE',
            metricName: 'Psychological Safety & Operational Well-being',
            sector: 'GLOBAL_TECH',
            p25Score: 75.0,
            p50MedianScore: 84.0,
            p90TopDecileScore: 96.0,
        },
        {
            metricKey: 'ENPS',
            metricName: 'Employee Net Promoter Score (eNPS)',
            sector: 'MANUFACTURING_FMCG',
            p25Score: 12.0,
            p50MedianScore: 32.0,
            p90TopDecileScore: 58.0,
        },
        {
            metricKey: 'SAFETY_COMPLIANCE',
            metricName: 'Plant Floor Safety & Physical Protocols',
            sector: 'MANUFACTURING_FMCG',
            p25Score: 82.0,
            p50MedianScore: 90.0,
            p90TopDecileScore: 98.0,
        },
        {
            metricKey: 'ENPS',
            metricName: 'Employee Net Promoter Score (eNPS)',
            sector: 'FINANCIAL_SERVICES',
            p25Score: 15.0,
            p50MedianScore: 35.0,
            p90TopDecileScore: 60.0,
        },
        {
            metricKey: 'LEADERSHIP_TRUST',
            metricName: 'Governance Trust & Strategic Communication',
            sector: 'FINANCIAL_SERVICES',
            p25Score: 65.0,
            p50MedianScore: 78.0,
            p90TopDecileScore: 93.0,
        },
        {
            metricKey: 'CAREER_GROWTH',
            metricName: 'Regulatory Compliance & Meritocratic Mobility',
            sector: 'FINANCIAL_SERVICES',
            p25Score: 54.0,
            p50MedianScore: 68.0,
            p90TopDecileScore: 84.0,
        },
        {
            metricKey: 'SAFETY_COMPLIANCE',
            metricName: 'Whistleblower Safety & Conduct Governance',
            sector: 'FINANCIAL_SERVICES',
            p25Score: 76.0,
            p50MedianScore: 86.0,
            p90TopDecileScore: 95.0,
        },
        {
            metricKey: 'ENPS',
            metricName: 'Employee Net Promoter Score (eNPS)',
            sector: 'TELECOM_TECH',
            p25Score: 22.0,
            p50MedianScore: 42.0,
            p90TopDecileScore: 68.0,
        },
        {
            metricKey: 'CAREER_GROWTH',
            metricName: 'Technical Upskilling & Agile Architecture',
            sector: 'TELECOM_TECH',
            p25Score: 60.0,
            p50MedianScore: 73.0,
            p90TopDecileScore: 89.0,
        },
        {
            metricKey: 'LEADERSHIP_TRUST',
            metricName: 'Engineering Autonomy & Executive Vision',
            sector: 'TELECOM_TECH',
            p25Score: 59.0,
            p50MedianScore: 72.0,
            p90TopDecileScore: 88.0,
        },
        {
            metricKey: 'SAFETY_COMPLIANCE',
            metricName: 'On-Call Burnout & Psychological Safety',
            sector: 'TELECOM_TECH',
            p25Score: 68.0,
            p50MedianScore: 79.0,
            p90TopDecileScore: 91.0,
        },
        {
            metricKey: 'ENPS',
            metricName: 'Employee Net Promoter Score (eNPS)',
            sector: 'DIVERSIFIED_CONGLOMERATE',
            p25Score: 14.0,
            p50MedianScore: 34.0,
            p90TopDecileScore: 59.0,
        },
        {
            metricKey: 'CAREER_GROWTH',
            metricName: 'Cross-Business Unit Mobility & Leadership Development',
            sector: 'DIVERSIFIED_CONGLOMERATE',
            p25Score: 52.0,
            p50MedianScore: 67.0,
            p90TopDecileScore: 83.0,
        },
        {
            metricKey: 'LEADERSHIP_TRUST',
            metricName: 'Conglomerate Board Transparency & Ethical Direction',
            sector: 'DIVERSIFIED_CONGLOMERATE',
            p25Score: 61.0,
            p50MedianScore: 75.0,
            p90TopDecileScore: 90.0,
        },
        {
            metricKey: 'SAFETY_COMPLIANCE',
            metricName: 'Multi-Site Safety Standards & Audit Integrity',
            sector: 'DIVERSIFIED_CONGLOMERATE',
            p25Score: 77.0,
            p50MedianScore: 87.0,
            p90TopDecileScore: 96.0,
        },
    ]);
    console.log('[TESP Seeder] 9. Seeding Client Engagements for Multi-Consultant Advisory Firms...');
    await consultant_models_1.ClientEngagementModel.insertMany([
        {
            projectId,
            firmId: 'FIRM-DAASH-01',
            clientName: 'Aitken Spence PLC',
            clientCode: 'ASP',
            sector: 'MANUFACTURING_FMCG',
            leadConsultant: 'Dr. Samantha Perera (Daash Global)',
            stage: 'EXECUTIVE_WORKSHOP',
            health: 'OPTIMAL',
            responseRate: 84.2,
            totalEmployees: 4850,
            activeSurveys: 2,
            lastDiagnosticDate: '2026-08-01',
            nextMilestone: 'Plant Floor Operational Alignment Workshop',
        },
        {
            projectId: apacProjectId,
            firmId: 'FIRM-TALNOVA-01',
            clientName: 'Dialog Axiata PLC',
            clientCode: 'DIA',
            sector: 'GLOBAL_TECH',
            leadConsultant: 'Michael Vandort (Talnova Human Capital Advisory)',
            stage: 'ACTION_SIGNOFF',
            health: 'OPTIMAL',
            responseRate: 91.5,
            totalEmployees: 3200,
            activeSurveys: 3,
            lastDiagnosticDate: '2026-07-28',
            nextMilestone: 'Engineering Progression Band Sign-off',
        },
        {
            projectId: nestleProjectId,
            firmId: 'FIRM-DAASH-01',
            clientName: 'Nestlé Lanka',
            clientCode: 'NES',
            sector: 'MANUFACTURING_FMCG',
            leadConsultant: 'Tanya Jayawardena (Daash Global)',
            stage: 'AI_SYNTHESIS',
            health: 'ATTENTION',
            responseRate: 69.1,
            totalEmployees: 1120,
            activeSurveys: 1,
            lastDiagnosticDate: '2026-08-12',
            nextMilestone: 'Sentiment Divergence Synthesis Review',
        },
    ]);
    console.log('[TESP Seeder] 10. Seeding Executive Workshops...');
    await consultant_models_1.ExecutiveWorkshopModel.insertMany([
        {
            projectId,
            firmId: 'FIRM-DAASH-01',
            title: 'Executive Strategic Alignment & Frontline Culture Workshop',
            clientName: 'Aitken Spence PLC',
            consultantLead: 'Dr. Samantha Perera (Daash Global)',
            scheduledDate: '2026-09-15',
            status: 'READY_FOR_EXEC',
            keyThemes: [
                'Leadership Transparency across Hotel Clusters',
                'Shift Rotation Workload in Cargo Freight',
            ],
            recommendedInterventions: [
                'Institute bi-monthly listening circles with resort heads',
                'Re-evaluate port operations overtime rotation with safety reps',
            ],
            actionPlanIds: ['ACT-ASP-001'],
        },
        {
            projectId: apacProjectId,
            firmId: 'FIRM-TALNOVA-01',
            title: 'Agile Engineering Retention & DevOps On-Call Balance',
            clientName: 'Dialog Axiata PLC',
            consultantLead: 'Michael Vandort (Talnova Human Capital Advisory)',
            scheduledDate: '2026-09-22',
            status: 'READY_FOR_EXEC',
            keyThemes: ['Cloud SRE Burnout Risk', 'Career Progression Banding Transparency'],
            recommendedInterventions: [
                'Deploy dual IC/Management technical progression track',
                'Automate alert triage in 5G NOC',
            ],
            actionPlanIds: ['ACT-DIA-001'],
        },
        {
            projectId: nestleProjectId,
            firmId: 'FIRM-DAASH-01',
            title: 'Factory Safety Culture & Ergonomics Alignment',
            clientName: 'Nestlé Lanka',
            consultantLead: 'Tanya Jayawardena (Daash Global)',
            scheduledDate: '2026-09-29',
            status: 'READY_FOR_EXEC',
            keyThemes: ['Near-Miss Incident Reporting Friction', 'High-Speed Packaging Ergonomics'],
            recommendedInterventions: [
                'Implement QR-based 1-click incident reporting kiosks',
                'Ergonomic supervisor pairing program',
            ],
            actionPlanIds: ['ACT-NES-001'],
        },
    ]);
    console.log('[TESP Seeder] 11. Seeding AI Sign-off Verification Queue...');
    await consultant_models_1.AiSignoffModel.insertMany([
        {
            projectId,
            firmId: 'FIRM-DAASH-01',
            surveyTitle: '2026 Aitken Spence Enterprise Engagement Survey',
            aiGeneratedInsight: 'Maritime and freight shift workers express 2.8x higher concern regarding physical workload and overtime transparency compared to corporate hospitality management.',
            confidenceScore: 94.2,
            riskSeverity: 'HIGH',
            consultantNotes: 'Reviewed with HR Director. Recommended restructuring port shift rotas and publishing transparent overtime guidelines.',
            signedOffBy: 'Dr. Samantha Perera (Daash Global)',
            signedOffAt: '2026-08-14T10:30:00.000Z',
            isVerified: true,
        },
        {
            projectId: apacProjectId,
            firmId: 'FIRM-TALNOVA-01',
            surveyTitle: '2026 Dialog Axiata Leadership & Digital Agility Survey',
            aiGeneratedInsight: 'DevOps and SRE teams report elevated alert fatigue during overnight release cycles, correlating with a 15-point drop in team psychological safety.',
            confidenceScore: 91.4,
            riskSeverity: 'CRITICAL',
            consultantNotes: undefined,
            signedOffBy: undefined,
            signedOffAt: undefined,
            isVerified: false,
        },
        {
            projectId: nestleProjectId,
            firmId: 'FIRM-DAASH-01',
            surveyTitle: '2026 Nestlé Lanka Safety & Operational Excellence Diagnostic',
            aiGeneratedInsight: 'Packaging line operators at Pannala factory indicate hesitation to log minor machine jams due to line stoppage performance metrics.',
            confidenceScore: 89.8,
            riskSeverity: 'MEDIUM',
            consultantNotes: undefined,
            signedOffBy: undefined,
            signedOffAt: undefined,
            isVerified: false,
        },
    ]);
    // Redis Token Cache across Workspaces
    const cache = new redis_token_repository_1.RedisTokenRepository();
    const testTokens = [
        {
            token: 'TKN-DEMO-2026',
            data: {
                projectId,
                campaignId: 'CMP-1001',
                surveyId: 'SRV-ENG-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-HOTELS-DIV',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
        {
            token: 'TKN-KIOSK-2026',
            data: {
                projectId,
                campaignId: 'CMP-1001',
                surveyId: 'SRV-ENG-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-COLOMBO-OPS',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
        {
            token: 'TKN-DIALOG-2026',
            data: {
                projectId: apacProjectId,
                campaignId: 'CMP-DIA-01',
                surveyId: 'SRV-DIALOG-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-5G-NETWORKS',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
        {
            token: 'TKN-DIA-KIOSK',
            data: {
                projectId: apacProjectId,
                campaignId: 'CMP-DIA-01',
                surveyId: 'SRV-DIALOG-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-CLOUD-INFRA',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
        {
            token: 'TKN-NESTLE-2026',
            data: {
                projectId: nestleProjectId,
                campaignId: 'CMP-NES-01',
                surveyId: 'SRV-NESTLE-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-PANNALA-FACTORY',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
        {
            token: 'TKN-NES-KIOSK',
            data: {
                projectId: nestleProjectId,
                campaignId: 'CMP-NES-01',
                surveyId: 'SRV-NESTLE-2026',
                surveyVersion: 1,
                anonymityLevel: 'SEMI_ANONYMOUS',
                nodeId: 'N-PACKAGING-LINE',
                expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            },
        },
    ];
    for (const t of testTokens) {
        try {
            await cache.cacheToken(t.token, t.data, 30 * 86400);
        }
        catch (e) {
            console.warn(`[TESP Seeder] Could not cache token ${t.token} in Redis:`, e);
        }
    }
    console.log('[TESP Seeder] Seeding tenant-scoped platform notifications...');
    await notification_schema_1.NotificationModel.create([
        // Aitken Spence PLC (PRJ-99201)
        {
            notificationId: 'NTF-99201-0001',
            projectId: 'PRJ-99201',
            recipientRole: auth_middleware_1.UserRole.CONSULTANT,
            category: 'AI_ANOMALY',
            severity: 'CRITICAL',
            title: 'NLP Sentiment Variance Spike (-14.2%)',
            message: 'Sentiment in "Maritime & Logistics Cargo" dropped by 14.2% across 210 responses. Qualitative themes suggest compensation and overtime dissatisfaction.',
            actionUrl: '/consultant',
            metadata: { dropPercent: 14.2, nodeName: 'Maritime & Logistics Cargo' },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
            notificationId: 'NTF-99201-0002',
            projectId: 'PRJ-99201',
            category: 'CAMPAIGN',
            severity: 'SUCCESS',
            title: 'Q1 Engagement Pulse Quorum Achieved (84.6%)',
            message: 'Response threshold crossed 80% statistical validity quorum for Aitken Spence PLC Group Corporate Office.',
            actionUrl: '/surveys',
            metadata: { quorumPercent: 84.6, campaignTitle: '2026 Annual Enterprise Engagement Pulse' },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 45),
        },
        {
            notificationId: 'NTF-99201-0003',
            projectId: 'PRJ-99201',
            category: 'REPORT',
            severity: 'INFO',
            title: 'Board Executive Evaluation Report Ready',
            message: 'The asynchronous executive PDF export for the Board of Directors has finished rendering and is available for download.',
            actionUrl: '/reports',
            metadata: { reportType: 'EXECUTIVE_SUMMARY' },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
        },
        {
            notificationId: 'NTF-99201-0004',
            projectId: 'PRJ-99201',
            category: 'COMPLIANCE',
            severity: 'WARNING',
            title: 'Differential Privacy Anonymity Filter Triggered',
            message: 'Automated suppression applied: 1 query in "Corporate Treasury" had respondent count k < 5, masking demographic breakdown to protect respondent identity.',
            actionUrl: '/analytics',
            metadata: { threshold: 5, actual: 3 },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 240),
        },
        {
            notificationId: 'NTF-99201-0005',
            projectId: 'PRJ-99201',
            category: 'HRIS',
            severity: 'INFO',
            title: 'Workday HRIS Automated Delta Sync Complete',
            message: '482 active employee records reconciled successfully. 6 new joiners provisioned and 2 departing employees safely de-indexed.',
            actionUrl: '/employees',
            metadata: { recordsSynced: 482, updated: 8 },
            isRead: true,
            readAt: new Date(Date.now() - 1000 * 60 * 300),
            createdAt: new Date(Date.now() - 1000 * 60 * 360),
        },
        // Dialog Axiata PLC (PRJ-APAC01)
        {
            notificationId: 'NTF-APAC01-0001',
            projectId: 'PRJ-APAC01',
            category: 'CAMPAIGN',
            severity: 'SUCCESS',
            title: 'Field Engineers Pulse 2026 Participation Crosses 90%',
            message: 'Outstanding field turnout: Dialog Network Operations team reached 91.2% participation ahead of cutoff.',
            actionUrl: '/surveys',
            metadata: { quorumPercent: 91.2 },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
            notificationId: 'NTF-APAC01-0002',
            projectId: 'PRJ-APAC01',
            recipientRole: auth_middleware_1.UserRole.CONSULTANT,
            category: 'AI_ANOMALY',
            severity: 'CRITICAL',
            title: 'Network Operations Division: Attrition Risk Alert',
            message: 'AI Early Warning Scanner flagged elevated burnout and intent-to-leave keywords among Colombo NOC engineers.',
            actionUrl: '/consultant',
            metadata: { dropPercent: 18.5, nodeName: 'Network Operations Center' },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 180),
        },
        // Nestlé Lanka (PRJ-NESTLE)
        {
            notificationId: 'NTF-NESTLE-0001',
            projectId: 'PRJ-NESTLE',
            category: 'CAMPAIGN',
            severity: 'INFO',
            title: 'Supply Chain & Factory Logistics Survey Dispatched',
            message: 'Outbound multi-channel dispatch triggered via Zoho ZeptoMail to 1,200 distribution center staff.',
            actionUrl: '/surveys',
            metadata: { recipientCount: 1200 },
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 90),
        },
    ]);
    console.log('[TESP Seeder] Seeded 8 multi-tenant notifications.');
    // Generate JWT Tokens for different actor personas
    const superAdminJwt = (0, auth_middleware_1.generateToken)({
        userId: 'USR-SUPERADMIN',
        role: auth_middleware_1.UserRole.SUPER_ADMIN,
        projectId,
    });
    const consultantJwt = (0, auth_middleware_1.generateToken)({
        userId: 'USR-CONSULTANT',
        role: auth_middleware_1.UserRole.CONSULTANT,
        projectId,
        firmId: 'FIRM-DAASH-01',
        firmName: 'Daash Global Advisory',
    });
    const talnovaConsultantJwt = (0, auth_middleware_1.generateToken)({
        userId: 'USR-CONSULTANT-TALNOVA',
        role: auth_middleware_1.UserRole.CONSULTANT,
        projectId: apacProjectId,
        firmId: 'FIRM-TALNOVA-01',
        firmName: 'Talnova Human Capital Advisory',
    });
    const orgAdminJwt = (0, auth_middleware_1.generateToken)({
        userId: 'USR-ORGADMIN',
        role: auth_middleware_1.UserRole.ORG_ADMIN,
        projectId,
    });
    console.log('\n======================================================');
    console.log('✅ [TESP Seeder] Multi-Tenant Seeding Completed Successfully!');
    console.log('======================================================');
    console.log(`Holding Workspace ID    : ${projectId} (Aitken Spence PLC)`);
    console.log(`Telco Workspace ID      : ${apacProjectId} (Dialog Axiata PLC)`);
    console.log(`FMCG Workspace ID       : ${nestleProjectId} (Nestlé Lanka)`);
    console.log(`Super Admin JWT (All)   : ${superAdminJwt}`);
    console.log(`Consultant JWT (Daash)  : ${consultantJwt}`);
    console.log(`Org Admin JWT (Client)  : ${orgAdminJwt}`);
    console.log(`Aitken Spence Intake    : http://localhost:5173/intake?token=TKN-DEMO-2026`);
    console.log(`Dialog Axiata Intake    : http://localhost:5173/intake?token=TKN-DIALOG-2026`);
    console.log(`Nestlé Lanka Intake     : http://localhost:5173/intake?token=TKN-NESTLE-2026`);
    console.log(`Kiosk URL               : http://localhost:5173/intake?mode=kiosk`);
    console.log('======================================================\n');
}
if (require.main === module) {
    seedDatabase()
        .then(async () => {
        await database_1.Database.disconnect();
        process.exit(0);
    })
        .catch((err) => {
        console.error('[TESP Seeder] Fatal seeding error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map