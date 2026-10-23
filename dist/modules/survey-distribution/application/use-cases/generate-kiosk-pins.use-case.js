"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateKioskPinsUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const token_vault_entity_1 = require("../../domain/entities/token-vault.entity");
const token_vault_schema_1 = require("../../infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../infrastructure/persistence/mongoose/campaign.schema");
class GenerateKioskPinsUseCase {
    tokenVaultModelOrRepo;
    campaignModelOrRepo;
    redisRepo;
    constructor(tokenVaultModelOrRepo, campaignModelOrRepo, redisRepo) {
        this.tokenVaultModelOrRepo = tokenVaultModelOrRepo;
        this.campaignModelOrRepo = campaignModelOrRepo;
        this.redisRepo = redisRepo;
    }
    async execute(projectId, campaignId, count) {
        const requestedCount = Math.max(1, Math.min(count || 6, 1000));
        // Resolve campaign
        let campaign = null;
        if (this.campaignModelOrRepo?.findByCampaignId) {
            campaign = await this.campaignModelOrRepo.findByCampaignId(projectId, campaignId);
        }
        if (!campaign && this.campaignModelOrRepo?.findOne) {
            campaign = await this.campaignModelOrRepo.findOne({ projectId, campaignId });
        }
        if (!campaign) {
            campaign = await campaign_schema_1.CampaignModel.findOne({ projectId, campaignId });
        }
        if (!campaign) {
            throw new Error(`Campaign '${campaignId}' not found`);
        }
        const surveyId = campaign.surveyId || 'SRV-ENG-2026';
        const surveyVersion = campaign.surveyVersion || 1;
        const anonymityLevel = campaign.anonymityLevel || 'KIOSK';
        const expirationDate = campaign.expirationDate || campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const ttlSeconds = Math.max(60, Math.floor((new Date(expirationDate).getTime() - Date.now()) / 1000));
        const pins = [];
        const tokenDocs = [];
        const tokenEntities = [];
        const generatedSet = new Set();
        for (let i = 0; i < requestedCount; i++) {
            let pin = crypto_1.default.randomInt(100000, 999999).toString();
            while (generatedSet.has(pin)) {
                pin = crypto_1.default.randomInt(100000, 999999).toString();
            }
            generatedSet.add(pin);
            pins.push(pin);
            const tokenDoc = {
                token: pin,
                tokenHash: pin,
                projectId,
                campaignId,
                surveyId,
                channel: 'PIN_KIOSK',
                isBurned: false,
                expiresAt: expirationDate,
                createdAt: new Date(),
            };
            tokenDocs.push(tokenDoc);
            tokenEntities.push(new token_vault_entity_1.TokenVaultEntity({
                projectId,
                campaignId,
                token: pin,
                tokenHash: pin,
                channel: 'PIN_KIOSK',
                isBurned: false,
                expiresAt: expirationDate,
                createdAt: tokenDoc.createdAt,
            }));
            // Cache token in Redis / memory cache
            if (this.redisRepo && typeof this.redisRepo.cacheToken === 'function') {
                const payload = {
                    projectId,
                    campaignId,
                    surveyId,
                    surveyVersion,
                    anonymityLevel,
                    expirationDate: new Date(expirationDate).toISOString(),
                };
                await this.redisRepo.cacheToken(pin, payload, ttlSeconds);
                // Also cache PIN- prefixed token for kiosk intake player convenience
                await this.redisRepo.cacheToken(`PIN-${pin}`, payload, ttlSeconds);
            }
        }
        // Persist to TokenVault
        if (this.tokenVaultModelOrRepo?.saveBatch) {
            await this.tokenVaultModelOrRepo.saveBatch(tokenEntities);
        }
        else if (this.tokenVaultModelOrRepo?.insertMany) {
            await this.tokenVaultModelOrRepo.insertMany(tokenDocs);
        }
        else {
            await token_vault_schema_1.TokenVaultModel.insertMany(tokenDocs);
        }
        return pins;
    }
}
exports.GenerateKioskPinsUseCase = GenerateKioskPinsUseCase;
//# sourceMappingURL=generate-kiosk-pins.use-case.js.map