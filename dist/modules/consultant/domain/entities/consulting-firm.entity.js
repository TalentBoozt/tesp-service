"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultingFirmEntity = void 0;
class ConsultingFirmEntity {
    static FIRM_ID_REGEX = /^FIRM-[A-Za-z0-9_-]{2,30}$/;
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    firmId;
    _name;
    _slug;
    _contactEmail;
    _tier;
    _assignedProjectIds;
    _consultantUserIds;
    _isActive;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.firmId || !ConsultingFirmEntity.FIRM_ID_REGEX.test(props.firmId)) {
            throw new Error(`Invalid firmId '${props.firmId}'. Expected format: ^FIRM-[A-Za-z0-9_-]{2,30}$ (e.g. FIRM-DAASH-01).`);
        }
        if (!props.name || props.name.trim().length === 0) {
            throw new Error('Consulting firm name is required.');
        }
        const email = (props.contactEmail || '').trim().toLowerCase();
        if (!email || !ConsultingFirmEntity.EMAIL_REGEX.test(email)) {
            throw new Error(`Invalid contactEmail '${props.contactEmail}'.`);
        }
        this.firmId = props.firmId;
        this._name = props.name.trim();
        this._slug = props.slug || this._name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        this._contactEmail = email;
        this._tier = props.tier || 'ENTERPRISE';
        this._assignedProjectIds = Array.isArray(props.assignedProjectIds)
            ? [...new Set(props.assignedProjectIds)]
            : [];
        this._consultantUserIds = Array.isArray(props.consultantUserIds)
            ? [...new Set(props.consultantUserIds)]
            : [];
        this._isActive = props.isActive !== undefined ? props.isActive : true;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    // Getters
    get name() { return this._name; }
    get slug() { return this._slug; }
    get contactEmail() { return this._contactEmail; }
    get tier() { return this._tier; }
    get assignedProjectIds() { return [...this._assignedProjectIds]; }
    get consultantUserIds() { return [...this._consultantUserIds]; }
    get isActive() { return this._isActive; }
    get updatedAt() { return this._updatedAt; }
    // Business Methods
    assignProject(projectId) {
        if (!projectId || projectId.trim().length === 0) {
            throw new Error('projectId cannot be empty.');
        }
        if (!this._assignedProjectIds.includes(projectId)) {
            this._assignedProjectIds.push(projectId);
            this._updatedAt = new Date();
        }
    }
    unassignProject(projectId) {
        this._assignedProjectIds = this._assignedProjectIds.filter(id => id !== projectId);
        this._updatedAt = new Date();
    }
    setAssignedProjects(projectIds) {
        this._assignedProjectIds = [...new Set(projectIds.filter(id => !!id && id.trim().length > 0))];
        this._updatedAt = new Date();
    }
    addConsultantUser(userId) {
        if (!userId || userId.trim().length === 0) {
            throw new Error('userId cannot be empty.');
        }
        if (!this._consultantUserIds.includes(userId)) {
            this._consultantUserIds.push(userId);
            this._updatedAt = new Date();
        }
    }
    removeConsultantUser(userId) {
        this._consultantUserIds = this._consultantUserIds.filter(id => id !== userId);
        this._updatedAt = new Date();
    }
    isAssignedToProject(projectId) {
        return this._assignedProjectIds.includes(projectId);
    }
    updateProfile(name, contactEmail, tier) {
        if (!name || name.trim().length === 0) {
            throw new Error('Name cannot be empty.');
        }
        const email = (contactEmail || '').trim().toLowerCase();
        if (!email || !ConsultingFirmEntity.EMAIL_REGEX.test(email)) {
            throw new Error('Invalid contactEmail.');
        }
        this._name = name.trim();
        this._contactEmail = email;
        if (tier)
            this._tier = tier;
        this._updatedAt = new Date();
    }
    deactivate() {
        this._isActive = false;
        this._updatedAt = new Date();
    }
    activate() {
        this._isActive = true;
        this._updatedAt = new Date();
    }
    toJSON() {
        return {
            firmId: this.firmId,
            name: this._name,
            slug: this._slug,
            contactEmail: this._contactEmail,
            tier: this._tier,
            assignedProjectIds: this._assignedProjectIds,
            consultantUserIds: this._consultantUserIds,
            isActive: this._isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
        };
    }
}
exports.ConsultingFirmEntity = ConsultingFirmEntity;
//# sourceMappingURL=consulting-firm.entity.js.map