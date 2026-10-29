"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignLaunchedEvent = void 0;
class CampaignLaunchedEvent {
    eventId;
    eventType = 'CAMPAIGN_LAUNCHED';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.campaignId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'CAMPAIGN_LAUNCHED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.CampaignLaunchedEvent = CampaignLaunchedEvent;
//# sourceMappingURL=campaign-launched.event.js.map