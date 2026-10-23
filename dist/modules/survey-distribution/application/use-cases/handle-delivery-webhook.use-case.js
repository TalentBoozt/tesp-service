"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleDeliveryWebhookUseCase = void 0;
class HandleDeliveryWebhookUseCase {
    campaignRepo;
    constructor(campaignRepo) {
        this.campaignRepo = campaignRepo;
    }
    async execute(payload) {
        const { projectId, campaignId, eventType } = payload;
        let field = null;
        switch (eventType) {
            case 'DELIVERED':
                field = 'delivered';
                break;
            case 'OPENED':
                field = 'opened';
                break;
            case 'BOUNCED':
            case 'FAILED':
                field = 'bounced';
                break;
        }
        if (!field)
            return false;
        return await this.campaignRepo.incrementMetrics(projectId, campaignId, field, 1);
    }
}
exports.HandleDeliveryWebhookUseCase = HandleDeliveryWebhookUseCase;
//# sourceMappingURL=handle-delivery-webhook.use-case.js.map