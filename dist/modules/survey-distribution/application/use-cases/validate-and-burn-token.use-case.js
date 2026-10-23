"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateAndBurnTokenUseCase = void 0;
class ValidateAndBurnTokenUseCase {
    redisRepo;
    vaultRepo;
    campaignRepo;
    constructor(redisRepo, vaultRepo, campaignRepo) {
        this.redisRepo = redisRepo;
        this.vaultRepo = vaultRepo;
        this.campaignRepo = campaignRepo;
    }
    resolveAlternativeTokens(token) {
        const clean = (token || '').trim();
        const list = [clean];
        if (clean.startsWith('PIN-')) {
            list.push(clean.replace(/^PIN-/, ''));
        }
        else if (/^\d{6}$/.test(clean)) {
            list.push(`PIN-${clean}`);
        }
        return [...new Set(list)];
    }
    async validateToken(token) {
        const candidates = this.resolveAlternativeTokens(token);
        let payload = null;
        let matchedToken = candidates[0];
        for (const cand of candidates) {
            payload = await this.redisRepo.getTokenPayload(cand);
            if (payload) {
                matchedToken = cand;
                break;
            }
        }
        if (!payload && this.vaultRepo) {
            for (const cand of candidates) {
                const vaultDoc = await this.vaultRepo.findByToken(cand);
                if (vaultDoc) {
                    matchedToken = cand;
                    if (vaultDoc.isBurned) {
                        return { valid: false, burned: true, error: 'Token has already been burned' };
                    }
                    let expirationDate = new Date(Date.now() + 30 * 86400000).toISOString();
                    let surveyId = 'SRV-ENG-2026';
                    let surveyVersion = 1;
                    let anonymityLevel = 'SEMI_ANONYMOUS';
                    if (this.campaignRepo) {
                        const campaign = await this.campaignRepo.findByCampaignId(vaultDoc.projectId, vaultDoc.campaignId);
                        if (campaign) {
                            expirationDate = campaign.expirationDate.toISOString();
                            surveyId = campaign.surveyId;
                            surveyVersion = campaign.surveyVersion;
                            anonymityLevel = campaign.anonymityLevel;
                        }
                    }
                    payload = {
                        projectId: vaultDoc.projectId,
                        campaignId: vaultDoc.campaignId,
                        surveyId,
                        surveyVersion,
                        anonymityLevel,
                        nodeId: vaultDoc.nodeId,
                        employeeId: vaultDoc.employeeId,
                        expirationDate,
                    };
                    for (const c of candidates) {
                        await this.redisRepo.cacheToken(c, payload, 86400);
                    }
                    break;
                }
            }
        }
        if (!payload) {
            return { valid: false, burned: false, error: 'Token is invalid, expired, or burned' };
        }
        // Check expiration date
        if (new Date(payload.expirationDate).getTime() <= Date.now()) {
            for (const c of candidates) {
                await this.redisRepo.burnToken(c);
            }
            return { valid: false, burned: true, error: 'Campaign token has expired' };
        }
        return { valid: true, burned: false, payload };
    }
    async burnToken(token) {
        const valResult = await this.validateToken(token);
        if (!valResult.valid) {
            return valResult;
        }
        const candidates = this.resolveAlternativeTokens(token);
        let anyBurned = false;
        for (const cand of candidates) {
            const b = await this.redisRepo.burnToken(cand);
            if (b)
                anyBurned = true;
        }
        if (this.vaultRepo) {
            for (const cand of candidates) {
                const vb = await this.vaultRepo.burnToken(cand);
                if (vb)
                    anyBurned = true;
            }
        }
        if (!anyBurned) {
            return { valid: false, burned: true, error: 'Token could not be burned or was already consumed' };
        }
        // Increment completed count on campaign if available
        if (this.campaignRepo && valResult.payload) {
            await this.campaignRepo.incrementMetrics(valResult.payload.projectId, valResult.payload.campaignId, 'completed');
        }
        return {
            valid: true,
            burned: true,
            payload: valResult.payload,
        };
    }
}
exports.ValidateAndBurnTokenUseCase = ValidateAndBurnTokenUseCase;
//# sourceMappingURL=validate-and-burn-token.use-case.js.map