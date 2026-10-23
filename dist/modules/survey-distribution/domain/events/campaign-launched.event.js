"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignLaunchedEvent = void 0;
class CampaignLaunchedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'CAMPAIGN_LAUNCHED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.CampaignLaunchedEvent = CampaignLaunchedEvent;
//# sourceMappingURL=campaign-launched.event.js.map