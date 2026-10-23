"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectEntity = void 0;
const branding_vo_1 = require("../value-objects/branding.vo");
const feature_flags_vo_1 = require("../value-objects/feature-flags.vo");
const custom_attribute_vo_1 = require("../value-objects/custom-attribute.vo");
const email_config_vo_1 = require("../value-objects/email-config.vo");
const ai_config_vo_1 = require("../value-objects/ai-config.vo");
class ProjectEntity {
    static PROJECT_ID_REGEX = /^PRJ-[A-Z0-9_-]{3,20}$/;
    projectId;
    _name;
    _status;
    _branding;
    _supportedLocales;
    _defaultLocale;
    _features;
    _customAttributeDefinitions;
    _aiConfig;
    _emailConfig;
    _version;
    _isDeleted;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.projectId || !ProjectEntity.PROJECT_ID_REGEX.test(props.projectId)) {
            throw new Error(`Invalid projectId '${props.projectId}'. Must match regex pattern ^PRJ-[A-Z0-9_-]{3,20}$ (e.g. PRJ-99201).`);
        }
        if (!props.name || props.name.trim().length === 0) {
            throw new Error('Project name is required');
        }
        if (!props.supportedLocales || props.supportedLocales.length === 0) {
            throw new Error('At least one supported locale required');
        }
        if (!props.defaultLocale || props.defaultLocale.trim().length === 0) {
            throw new Error('Default locale is required');
        }
        if (!props.supportedLocales.includes(props.defaultLocale)) {
            throw new Error(`Default locale '${props.defaultLocale}' must be present in supportedLocales array [${props.supportedLocales.join(', ')}].`);
        }
        this.projectId = props.projectId;
        this._name = props.name.trim();
        this._status = props.status || 'ACTIVE';
        this._branding = new branding_vo_1.Branding(props.branding);
        this._supportedLocales = [...props.supportedLocales];
        this._defaultLocale = props.defaultLocale;
        this._features = new feature_flags_vo_1.FeatureFlags(props.features);
        this._customAttributeDefinitions = (props.customAttributeDefinitions || []).map((attr) => new custom_attribute_vo_1.CustomAttributeDefinition(attr));
        this._aiConfig = new ai_config_vo_1.AiConfig(props.aiConfig);
        this._emailConfig = new email_config_vo_1.EmailConfig(props.emailConfig || {
            provider: 'SIMULATED',
            fromName: `${props.name.trim()} Engagement Team`,
            fromEmail: 'no-reply@talnova.io',
        });
        this._version = props.version || 1;
        this._isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    // Getters
    get name() {
        return this._name;
    }
    get status() {
        return this._status;
    }
    get branding() {
        return this._branding;
    }
    get supportedLocales() {
        return [...this._supportedLocales];
    }
    get defaultLocale() {
        return this._defaultLocale;
    }
    get aiConfig() {
        return this._aiConfig.toJSON();
    }
    get emailConfig() {
        return this._emailConfig.toJSON();
    }
    get emailConfigVO() {
        return this._emailConfig;
    }
    get aiConfigVO() {
        return this._aiConfig;
    }
    updateEmailConfig(params) {
        if (this._isDeleted) {
            throw new Error('Cannot update email configuration for a soft-deleted project.');
        }
        this._emailConfig = new email_config_vo_1.EmailConfig({
            ...this._emailConfig.toJSON(),
            ...params,
        });
        this._version += 1;
        this._updatedAt = new Date();
    }
    updateAiConfig(params) {
        if (this._isDeleted) {
            throw new Error('Cannot update AI configuration for a soft-deleted project.');
        }
        this._aiConfig = new ai_config_vo_1.AiConfig({
            ...this._aiConfig.toJSON(),
            ...params,
        });
        this._version += 1;
        this._updatedAt = new Date();
    }
    get features() {
        return this._features;
    }
    get customAttributeDefinitions() {
        return [...this._customAttributeDefinitions];
    }
    get version() {
        return this._version;
    }
    get isDeleted() {
        return this._isDeleted;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    // Business Behavior & State Transitions
    updateDetails(params) {
        if (this._isDeleted) {
            throw new Error('Cannot update a soft-deleted project.');
        }
        if (params.name !== undefined) {
            if (!params.name || params.name.trim().length === 0) {
                throw new Error('Project name cannot be empty');
            }
            this._name = params.name.trim();
        }
        const nextSupportedLocales = params.supportedLocales ? [...params.supportedLocales] : this._supportedLocales;
        const nextDefaultLocale = params.defaultLocale !== undefined ? params.defaultLocale : this._defaultLocale;
        if (nextSupportedLocales.length === 0) {
            throw new Error('At least one supported locale required');
        }
        if (!nextSupportedLocales.includes(nextDefaultLocale)) {
            throw new Error(`Default locale '${nextDefaultLocale}' must be present in supportedLocales array [${nextSupportedLocales.join(', ')}].`);
        }
        this._supportedLocales = nextSupportedLocales;
        this._defaultLocale = nextDefaultLocale;
        if (params.branding) {
            this._branding = new branding_vo_1.Branding(params.branding);
        }
        if (params.customAttributeDefinitions) {
            this._customAttributeDefinitions = params.customAttributeDefinitions.map((attr) => new custom_attribute_vo_1.CustomAttributeDefinition(attr));
        }
        this._version += 1;
        this._updatedAt = new Date();
    }
    toggleFeatures(newFeatures) {
        if (this._isDeleted) {
            throw new Error('Cannot update feature flags for a soft-deleted project.');
        }
        this._features = new feature_flags_vo_1.FeatureFlags({
            ...this._features.toJSON(),
            ...newFeatures,
        });
        this._version += 1;
        this._updatedAt = new Date();
    }
    setStatus(newStatus) {
        if (this._status === 'ARCHIVED' && newStatus !== 'ARCHIVED') {
            throw new Error('Archived project cannot transition to active or draft state.');
        }
        this._status = newStatus;
        this._version += 1;
        this._updatedAt = new Date();
    }
    markAsDeleted() {
        this._isDeleted = true;
        this._status = 'ARCHIVED';
        this._version += 1;
        this._updatedAt = new Date();
    }
    toPublicThemeDTO() {
        return {
            projectId: this.projectId,
            companyName: this._branding.companyName,
            primaryColor: this._branding.primaryColor,
            secondaryColor: this._branding.secondaryColor,
            logoUrl: this._branding.logoUrl,
            defaultLocale: this._defaultLocale,
        };
    }
    toJSON() {
        return {
            projectId: this.projectId,
            name: this._name,
            status: this._status,
            branding: this._branding.toJSON(),
            supportedLocales: this._supportedLocales,
            defaultLocale: this._defaultLocale,
            features: this._features.toJSON(),
            customAttributeDefinitions: this._customAttributeDefinitions.map((attr) => attr.toJSON()),
            aiConfig: this._aiConfig.toJSON(),
            emailConfig: this._emailConfig.toJSON(),
            version: this._version,
            isDeleted: this._isDeleted,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.ProjectEntity = ProjectEntity;
//# sourceMappingURL=project.entity.js.map