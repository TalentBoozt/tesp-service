"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenGeneratorService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const campaign_entity_1 = require("../entities/campaign.entity");
class TokenGeneratorService {
    static SALT_SECRET = process.env.TOKEN_SALT_SECRET || 'tesp-secret-campaign-salt';
    generateToken(anonymityLevel, campaignId, employeeId) {
        switch (anonymityLevel) {
            case campaign_entity_1.AnonymityLevel.KIOSK:
                return this.generate6DigitPin();
            case campaign_entity_1.AnonymityLevel.SEMI_ANONYMOUS:
                if (employeeId) {
                    return crypto_1.default
                        .createHmac('sha256', TokenGeneratorService.SALT_SECRET)
                        .update(`${campaignId}:${employeeId}:${crypto_1.default.randomBytes(8).toString('hex')}`)
                        .digest('hex')
                        .substring(0, 32);
                }
                return `SA-${crypto_1.default.randomBytes(16).toString('hex')}`;
            case campaign_entity_1.AnonymityLevel.AUTHENTICATED:
                return `AUTH-${crypto_1.default.randomBytes(16).toString('hex')}`;
            case campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS:
            default:
                return `FA-${crypto_1.default.randomBytes(16).toString('hex')}`;
        }
    }
    generate6DigitPin() {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        return pin;
    }
}
exports.TokenGeneratorService = TokenGeneratorService;
//# sourceMappingURL=token-generator.service.js.map