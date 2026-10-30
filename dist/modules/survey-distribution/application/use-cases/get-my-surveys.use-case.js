"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMySurveysUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const token_vault_schema_1 = require("../../infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../infrastructure/persistence/mongoose/campaign.schema");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const field_encryption_service_1 = require("../../../../shared/infrastructure/security/field-encryption.service");
class GetMySurveysUseCase {
    campaignRepo;
    vaultRepo;
    constructor(campaignRepo, vaultRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
    }
    async execute(projectId, employeeId, email) {
        if (!employeeId && !email && !projectId) {
            return [];
        }
        const candidateIds = new Set();
        if (employeeId && employeeId.trim())
            candidateIds.add(employeeId.trim());
        if (email && email.trim())
            candidateIds.add(email.trim().toLowerCase());
        let employeeDoc = null;
        if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const { EmployeeModel } = await Promise.resolve().then(() => __importStar(require('../../../employee/infrastructure/persistence/mongoose/employee.schema')));
                const { UserModel } = await Promise.resolve().then(() => __importStar(require('../../../auth/infrastructure/persistence/user.schema')));
                // Check if employeeId matches a registered User account
                if (employeeId) {
                    const userDoc = await UserModel.findOne({
                        $or: [{ userId: employeeId }, { employeeId }],
                    }).lean();
                    if (userDoc?.employeeId)
                        candidateIds.add(userDoc.employeeId);
                    if (userDoc?.email)
                        candidateIds.add(userDoc.email.trim().toLowerCase());
                }
                // Search Employee roster using candidate IDs or email blind index
                const orConditions = [];
                for (const cid of candidateIds) {
                    orConditions.push({ employeeId: cid });
                    orConditions.push({ employeeCode: cid });
                    if (mongoose_1.default.isValidObjectId(cid)) {
                        orConditions.push({ _id: cid });
                    }
                }
                if (email) {
                    try {
                        const bIdx = field_encryption_service_1.FieldEncryptionService.blindIndex(email);
                        orConditions.push({ emailBlindIndex: bIdx });
                    }
                    catch { }
                }
                if (orConditions.length > 0) {
                    employeeDoc = await EmployeeModel.findOne({
                        projectId,
                        isDeleted: { $ne: true },
                        $or: orConditions,
                    }).lean();
                    if (employeeDoc) {
                        if (employeeDoc.employeeId)
                            candidateIds.add(employeeDoc.employeeId);
                        if (employeeDoc.employeeCode)
                            candidateIds.add(employeeDoc.employeeCode);
                        if (employeeDoc._id)
                            candidateIds.add(employeeDoc._id.toString());
                    }
                }
            }
            catch (err) {
                console.warn('[GetMySurveysUseCase] Error resolving employee document:', err);
            }
        }
        // 1. Find existing tokens in TokenVault
        let tokens = [];
        if (this.vaultRepo && typeof this.vaultRepo.findUnburnedByEmployee === 'function' && employeeId) {
            try {
                tokens = await this.vaultRepo.findUnburnedByEmployee(projectId, employeeId);
            }
            catch { }
        }
        if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const found = await token_vault_schema_1.TokenVaultModel.find({
                    projectId,
                    employeeId: { $in: Array.from(candidateIds) },
                }).sort({ createdAt: -1 }).lean();
                if (found && found.length > 0) {
                    tokens = found;
                }
            }
            catch (err) {
                console.warn('[GetMySurveysUseCase] Error querying token vault:', err);
            }
        }
        // Group existing tokens by campaignId (most recent token per campaign)
        const tokenByCampaignId = new Map();
        for (const t of tokens) {
            if (!tokenByCampaignId.has(t.campaignId)) {
                tokenByCampaignId.set(t.campaignId, t);
            }
        }
        // 2. Fetch all active campaigns for this tenant project
        const now = new Date();
        let activeCampaigns = [];
        if (this.campaignRepo) {
            const allActive = await this.campaignRepo.findAll(projectId, { status: campaign_entity_1.CampaignStatus.ACTIVE });
            activeCampaigns = allActive.filter((c) => new Date(c.expirationDate) > now);
        }
        if (activeCampaigns.length === 0 && mongoose_1.default.connection?.readyState === 1) {
            try {
                activeCampaigns = await campaign_schema_1.CampaignModel.find({
                    projectId,
                    status: 'ACTIVE',
                    isDeleted: { $ne: true },
                    expirationDate: { $gt: now },
                }).lean();
            }
            catch {
                activeCampaigns = [];
            }
        }
        // Also include any campaign the respondent holds a token for
        const activeCampaignIds = new Set(activeCampaigns.map((c) => c.campaignId));
        const tokenCampaignIds = Array.from(tokenByCampaignId.keys()).filter((cid) => !activeCampaignIds.has(cid));
        if (tokenCampaignIds.length > 0 && mongoose_1.default.connection?.readyState === 1) {
            try {
                const extraCampaigns = await campaign_schema_1.CampaignModel.find({
                    projectId,
                    campaignId: { $in: tokenCampaignIds },
                    isDeleted: { $ne: true },
                }).lean();
                for (const ec of extraCampaigns) {
                    activeCampaigns.push(ec);
                }
            }
            catch { }
        }
        // 3. Map campaigns to MySurveyItem with dynamic token resolution
        const mySurveys = [];
        for (const campaign of activeCampaigns) {
            // Check targeting eligibility
            const targetNodes = campaign.targetAudience?.nodeIds || [];
            const hasNodeRestriction = targetNodes.length > 0 && !targetNodes.includes('GLOBAL') && !targetNodes.includes('*');
            if (hasNodeRestriction && employeeDoc?.nodeId) {
                const matchesNode = targetNodes.includes(employeeDoc.nodeId) ||
                    (employeeDoc.matrixNodeIds &&
                        employeeDoc.matrixNodeIds.some((n) => targetNodes.includes(n)));
                const hasDirectToken = tokenByCampaignId.has(campaign.campaignId);
                if (!matchesNode && !hasDirectToken) {
                    continue; // Respondent is outside targeted organizational unit
                }
            }
            let vaultRecord = tokenByCampaignId.get(campaign.campaignId);
            // If no token exists in vault for this respondent, dynamically provision a single-use token
            if (!vaultRecord && mongoose_1.default.connection?.readyState === 1) {
                try {
                    const rawToken = crypto_1.default.randomBytes(16).toString('hex');
                    const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
                    const targetEmpId = employeeDoc?.employeeId || employeeId || Array.from(candidateIds)[0] || 'ANONYMOUS';
                    const createdVaultDoc = await token_vault_schema_1.TokenVaultModel.create({
                        projectId,
                        campaignId: campaign.campaignId,
                        token: rawToken,
                        tokenHash,
                        channel: (campaign.channels && campaign.channels[0]) || 'EMAIL',
                        employeeId: targetEmpId,
                        nodeId: employeeDoc?.nodeId,
                        matrixNodeIds: employeeDoc?.matrixNodeIds || [],
                        isBurned: false,
                        expiresAt: campaign.expirationDate,
                    });
                    vaultRecord = createdVaultDoc.toObject ? createdVaultDoc.toObject() : createdVaultDoc;
                    tokenByCampaignId.set(campaign.campaignId, vaultRecord);
                }
                catch (mintErr) {
                    console.warn('[GetMySurveysUseCase] Error auto-minting token:', mintErr);
                }
            }
            const rawToken = vaultRecord ? vaultRecord.token.replace(/^PIN-/, '') : `CMP-${campaign.campaignId}`;
            const isPin = /^\d{6}$/.test(rawToken) || vaultRecord?.channel === 'PIN_KIOSK';
            const surveyUrl = isPin
                ? `/intake?mode=kiosk&campaignId=${campaign.campaignId}&token=${rawToken}`
                : vaultRecord?.token
                    ? `/p?t=${rawToken}`
                    : `/intake/${campaign.campaignId}`;
            const isBurned = !!vaultRecord?.isBurned;
            mySurveys.push({
                campaignId: campaign.campaignId,
                title: campaign.title,
                surveyId: campaign.surveyId,
                surveyVersion: campaign.surveyVersion,
                anonymityLevel: campaign.anonymityLevel,
                channel: (vaultRecord && vaultRecord.channel) || (campaign.channels && campaign.channels[0]) || 'EMAIL',
                token: rawToken,
                pin: isPin ? rawToken : undefined,
                surveyUrl,
                expirationDate: campaign.expirationDate instanceof Date
                    ? campaign.expirationDate.toISOString()
                    : new Date(campaign.expirationDate).toISOString(),
                startDate: campaign.startDate
                    ? campaign.startDate instanceof Date
                        ? campaign.startDate.toISOString()
                        : new Date(campaign.startDate).toISOString()
                    : undefined,
                status: isBurned ? 'COMPLETED' : 'ACTIVE',
            });
        }
        return mySurveys;
    }
}
exports.GetMySurveysUseCase = GetMySurveysUseCase;
//# sourceMappingURL=get-my-surveys.use-case.js.map