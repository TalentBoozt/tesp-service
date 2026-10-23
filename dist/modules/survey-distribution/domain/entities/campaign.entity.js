"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignEntity = exports.CampaignStatus = exports.DistributionChannel = exports.AnonymityLevel = void 0;
var AnonymityLevel;
(function (AnonymityLevel) {
    AnonymityLevel["AUTHENTICATED"] = "AUTHENTICATED";
    AnonymityLevel["SEMI_ANONYMOUS"] = "SEMI_ANONYMOUS";
    AnonymityLevel["FULLY_ANONYMOUS"] = "FULLY_ANONYMOUS";
    AnonymityLevel["KIOSK"] = "KIOSK";
})(AnonymityLevel || (exports.AnonymityLevel = AnonymityLevel = {}));
var DistributionChannel;
(function (DistributionChannel) {
    DistributionChannel["EMAIL"] = "EMAIL";
    DistributionChannel["SMS"] = "SMS";
    DistributionChannel["QR_CODE"] = "QR_CODE";
    DistributionChannel["KIOSK_PIN"] = "KIOSK_PIN";
    DistributionChannel["TEAMS"] = "TEAMS";
    DistributionChannel["SLACK"] = "SLACK";
})(DistributionChannel || (exports.DistributionChannel = DistributionChannel = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "DRAFT";
    CampaignStatus["SCHEDULED"] = "SCHEDULED";
    CampaignStatus["ACTIVE"] = "ACTIVE";
    CampaignStatus["PAUSED"] = "PAUSED";
    CampaignStatus["COMPLETED"] = "COMPLETED";
    CampaignStatus["EXPIRED"] = "EXPIRED";
    CampaignStatus["CANCELLED"] = "CANCELLED";
    CampaignStatus["ARCHIVED"] = "ARCHIVED";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
class CampaignEntity {
    projectId;
    campaignId;
    surveyId;
    surveyVersion;
    title;
    anonymityLevel;
    channels;
    targetAudience;
    schedule;
    metrics;
    status;
    startDate;
    expirationDate;
    isDeleted;
    createdAt;
    updatedAt;
    constructor(props) {
        this.validateIdFormat(props.campaignId);
        this.validateDates(props.startDate, props.expirationDate);
        this.validateChannels(props.channels);
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.surveyId = props.surveyId;
        this.surveyVersion = props.surveyVersion;
        this.title = props.title;
        this.anonymityLevel = props.anonymityLevel;
        this.channels = props.channels;
        this.targetAudience = props.targetAudience || {};
        this.schedule = props.schedule || {};
        this.metrics = props.metrics || {
            totalTargeted: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            started: 0,
            completed: 0,
            bounced: 0,
        };
        this.status = props.status;
        this.startDate = props.startDate;
        this.expirationDate = props.expirationDate;
        this.isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    validateIdFormat(campaignId) {
        const pattern = /^CMP-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(campaignId)) {
            throw new Error(`Invalid Campaign ID format: '${campaignId}'. Must match pattern ^CMP-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    validateDates(startDate, expirationDate) {
        if (expirationDate.getTime() <= startDate.getTime()) {
            throw new Error('Invalid campaign expiration date: expirationDate must be after startDate');
        }
    }
    validateChannels(channels) {
        if (!channels || channels.length === 0) {
            throw new Error('At least one distribution channel is required');
        }
    }
    launch(totalTargeted) {
        if (this.status !== CampaignStatus.DRAFT && this.status !== CampaignStatus.SCHEDULED) {
            throw new Error(`Cannot launch campaign in state '${this.status}'`);
        }
        this.status = CampaignStatus.ACTIVE;
        this.metrics.totalTargeted = totalTargeted;
        this.updatedAt = new Date();
    }
    pause() {
        if (this.status !== CampaignStatus.ACTIVE) {
            throw new Error(`Cannot pause campaign in state '${this.status}'`);
        }
        this.status = CampaignStatus.PAUSED;
        this.updatedAt = new Date();
    }
    resume() {
        if (this.status !== CampaignStatus.PAUSED) {
            throw new Error(`Cannot resume campaign in state '${this.status}'`);
        }
        this.status = CampaignStatus.ACTIVE;
        this.updatedAt = new Date();
    }
    cancel() {
        if (this.status === CampaignStatus.COMPLETED || this.status === CampaignStatus.ARCHIVED) {
            throw new Error(`Cannot cancel campaign in state '${this.status}'`);
        }
        this.status = CampaignStatus.CANCELLED;
        this.updatedAt = new Date();
    }
    checkExpiration(now = new Date()) {
        if (this.status === CampaignStatus.ACTIVE && now.getTime() >= this.expirationDate.getTime()) {
            this.status = CampaignStatus.EXPIRED;
            this.updatedAt = new Date();
        }
    }
    incrementMetric(type, count = 1) {
        if (this.metrics[type] !== undefined) {
            this.metrics[type] += count;
            if (this.metrics.completed >= this.metrics.totalTargeted && this.metrics.totalTargeted > 0) {
                this.status = CampaignStatus.COMPLETED;
            }
            this.updatedAt = new Date();
        }
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            surveyId: this.surveyId,
            surveyVersion: this.surveyVersion,
            title: this.title,
            anonymityLevel: this.anonymityLevel,
            channels: this.channels,
            targetAudience: this.targetAudience,
            schedule: this.schedule,
            metrics: { ...this.metrics },
            status: this.status,
            startDate: this.startDate,
            expirationDate: this.expirationDate,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.CampaignEntity = CampaignEntity;
//# sourceMappingURL=campaign.entity.js.map