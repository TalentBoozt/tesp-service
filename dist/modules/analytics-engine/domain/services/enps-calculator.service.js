"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnpsCalculatorService = void 0;
class EnpsCalculatorService {
    calculateEnps(scores) {
        if (!scores || scores.length === 0) {
            return {
                eNPS: null,
                totalResponses: 0,
                promoters: 0,
                passives: 0,
                detractors: 0,
                promoterPercent: 0,
                passivePercent: 0,
                detractorPercent: 0,
            };
        }
        let promoters = 0;
        let passives = 0;
        let detractors = 0;
        for (const score of scores) {
            if (score >= 9) {
                promoters++;
            }
            else if (score >= 7) {
                passives++;
            }
            else {
                detractors++;
            }
        }
        const total = scores.length;
        const promoterPercent = (promoters / total) * 100;
        const passivePercent = (passives / total) * 100;
        const detractorPercent = (detractors / total) * 100;
        const eNPS = Math.round((promoterPercent - detractorPercent) * 10) / 10;
        return {
            eNPS,
            totalResponses: total,
            promoters,
            passives,
            detractors,
            promoterPercent: Math.round(promoterPercent * 10) / 10,
            passivePercent: Math.round(passivePercent * 10) / 10,
            detractorPercent: Math.round(detractorPercent * 10) / 10,
        };
    }
}
exports.EnpsCalculatorService = EnpsCalculatorService;
//# sourceMappingURL=enps-calculator.service.js.map