"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMySurveysUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const token_vault_schema_1 = require("../../infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../infrastructure/persistence/mongoose/campaign.schema");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
class GetMySurveysUseCase {
    campaignRepo;
    vaultRepo;
    constructor(campaignRepo, vaultRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
    }
    async execute(projectId, employeeId, email) {
        if (!employeeId && !email) {
            return [];
        }
        // 1. Find unburned tokens for this employee in the project
        let tokens = [];
        if (this.vaultRepo && typeof this.vaultRepo.findUnburnedByEmployee === 'function') {
            tokens = await this.vaultRepo.findUnburnedByEmployee(projectId, employeeId);
        }
        else if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const orConditions = [];
                if (employeeId) {
                    orConditions.push({ employeeId });
                }
                const vaultQuery = {
                    projectId,
                    isBurned: false,
                    $or: orConditions,
                };
                tokens = await token_vault_schema_1.TokenVaultModel.find(vaultQuery).sort({ createdAt: -1 });
            }
            catch {
                tokens = [];
            }
        }
        if (tokens.length === 0) {
            return [];
        }
        // Group tokens by campaignId (take the most recent token per campaign)
        const tokenByCampaignId = new Map();
        for (const t of tokens) {
            if (!tokenByCampaignId.has(t.campaignId)) {
                tokenByCampaignId.set(t.campaignId, t);
            }
        }
        const campaignIds = Array.from(tokenByCampaignId.keys());
        // 2. Fetch active campaigns
        const now = new Date();
        let activeCampaigns = [];
        if (this.campaignRepo) {
            const allActive = await this.campaignRepo.findAll(projectId, { status: campaign_entity_1.CampaignStatus.ACTIVE });
            activeCampaigns = allActive.filter((c) => campaignIds.includes(c.campaignId) && new Date(c.expirationDate) > now);
        }
        if (activeCampaigns.length === 0 && mongoose_1.default.connection?.readyState === 1) {
            try {
                activeCampaigns = await campaign_schema_1.CampaignModel.find({
                    projectId,
                    campaignId: { $in: campaignIds },
                    status: 'ACTIVE',
                    expirationDate: { $gt: now },
                });
            }
            catch {
                // Fallback
            }
        }
        // 3. Map to MySurveyItem
        const mySurveys = [];
        for (const campaign of activeCampaigns) {
            const vaultRecord = tokenByCampaignId.get(campaign.campaignId);
            if (!vaultRecord)
                continue;
            const rawToken = vaultRecord.token.replace(/^PIN-/, '');
            const isPin = /^\d{6}$/.test(rawToken) || vaultRecord.channel === 'PIN_KIOSK';
            const surveyUrl = isPin
                ? `/intake?mode=kiosk&campaignId=${campaign.campaignId}&token=${rawToken}`
                : `/intake?token=${rawToken}`;
            mySurveys.push({
                campaignId: campaign.campaignId,
                title: campaign.title,
                surveyId: campaign.surveyId,
                surveyVersion: campaign.surveyVersion,
                anonymityLevel: campaign.anonymityLevel,
                channel: vaultRecord.channel || campaign.channels[0],
                token: rawToken,
                pin: isPin ? rawToken : undefined,
                surveyUrl,
                expirationDate: campaign.expirationDate.toISOString(),
                startDate: campaign.startDate ? campaign.startDate.toISOString() : undefined,
            });
        }
        return mySurveys;
    }
}
exports.GetMySurveysUseCase = GetMySurveysUseCase;
//# sourceMappingURL=get-my-surveys.use-case.js.map