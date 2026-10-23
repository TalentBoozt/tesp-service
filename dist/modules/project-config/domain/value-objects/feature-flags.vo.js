"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlags = void 0;
class FeatureFlags {
    aiAnalyticsEnabled;
    actionPlanningEnabled;
    kioskModeEnabled;
    smsDistributionEnabled;
    constructor(props) {
        this.aiAnalyticsEnabled = props?.aiAnalyticsEnabled ?? true;
        this.actionPlanningEnabled = props?.actionPlanningEnabled ?? true;
        this.kioskModeEnabled = props?.kioskModeEnabled ?? false;
        this.smsDistributionEnabled = props?.smsDistributionEnabled ?? false;
    }
    toJSON() {
        return {
            aiAnalyticsEnabled: this.aiAnalyticsEnabled,
            actionPlanningEnabled: this.actionPlanningEnabled,
            kioskModeEnabled: this.kioskModeEnabled,
            smsDistributionEnabled: this.smsDistributionEnabled,
        };
    }
}
exports.FeatureFlags = FeatureFlags;
//# sourceMappingURL=feature-flags.vo.js.map