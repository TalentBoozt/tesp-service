"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyEntity = void 0;
class SurveyEntity {
    static SURVEY_ID_REGEX = /^SRV-[A-Za-z0-9_-]{3,20}$/;
    projectId;
    surveyId;
    _version;
    _title;
    _description;
    _status;
    _pages;
    _publishedAt;
    _versionHistory;
    _isDeleted;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required');
        }
        if (!props.surveyId || !SurveyEntity.SURVEY_ID_REGEX.test(props.surveyId)) {
            throw new Error(`Invalid Survey ID format '${props.surveyId}'. Expected format: ^SRV-[A-Za-z0-9_-]{3,20}$ (e.g. SRV-5001).`);
        }
        if (!props.title || Object.keys(props.title).length === 0) {
            throw new Error('Survey title is required and must contain at least one locale string (VR-SRV-004).');
        }
        this.projectId = props.projectId;
        this.surveyId = props.surveyId;
        this._version = props.version || 1;
        this._title = { ...props.title };
        this._description = props.description ? { ...props.description } : undefined;
        this._status = props.status || 'DRAFT';
        this._pages = props.pages || [];
        this._publishedAt = props.publishedAt || null;
        this._versionHistory = props.versionHistory || [];
        this._isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        // Validate Question Groups Invariant (BR-SRV-002)
        this.validateQuestionGroups(this._pages);
    }
    // Getters
    get version() {
        return this._version;
    }
    get title() {
        return { ...this._title };
    }
    get description() {
        return this._description ? { ...this._description } : undefined;
    }
    get status() {
        return this._status;
    }
    get pages() {
        return JSON.parse(JSON.stringify(this._pages));
    }
    get publishedAt() {
        return this._publishedAt;
    }
    get versionHistory() {
        return [...this._versionHistory];
    }
    get isDeleted() {
        return this._isDeleted;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    validateQuestionGroups(pages) {
        pages.forEach((page) => {
            page.sections.forEach((section) => {
                section.questions.forEach((q) => {
                    if (['LIKERT', 'NPS', 'MATRIX'].includes(q.type)) {
                        if (!q.groupId || q.groupId.trim().length === 0) {
                            throw new Error(`Question '${q.questionId}' of type '${q.type}' MUST belong to a valid Question Group (groupId) for analytical aggregation.`);
                        }
                    }
                });
            });
        });
    }
    // Business Logic Methods
    updateDraft(params) {
        // BR-SRV-001 & TC-SRV-001: Active Survey Edit Lock
        if (this._status === 'PUBLISHED' || this._status === 'ACTIVE') {
            throw new Error('Cannot modify structural design of a published survey version. Create a new draft version to edit.');
        }
        if (this._isDeleted) {
            throw new Error('Cannot update a soft-deleted survey.');
        }
        if (params.title) {
            if (Object.keys(params.title).length === 0) {
                throw new Error('Survey title cannot be empty.');
            }
            this._title = { ...params.title };
        }
        if (params.description) {
            this._description = { ...params.description };
        }
        if (params.pages) {
            this.validateQuestionGroups(params.pages);
            this._pages = params.pages;
        }
        this._updatedAt = new Date();
    }
    publish(publisherId) {
        if (this._status === 'PUBLISHED' || this._status === 'ACTIVE') {
            throw new Error('Survey version is already published.');
        }
        // VR-SRV-002: Survey must contain at least 1 Page, 1 Section, and 1 Question
        if (!this._pages || this._pages.length === 0) {
            throw new Error('Cannot publish empty survey. Survey must contain at least 1 Page (VR-SRV-002).');
        }
        let hasQuestion = false;
        this._pages.forEach((p) => {
            p.sections.forEach((s) => {
                if (s.questions && s.questions.length > 0) {
                    hasQuestion = true;
                }
            });
        });
        if (!hasQuestion) {
            throw new Error('Cannot publish empty survey. Must contain at least 1 Page, 1 Section, and 1 Question (VR-SRV-002).');
        }
        this._status = 'PUBLISHED';
        this._publishedAt = new Date();
        this._versionHistory.push({
            version: this._version,
            publishedAt: this._publishedAt,
            publishedBy: publisherId,
        });
        this._updatedAt = new Date();
    }
    createDraftClone() {
        // FR-SRV-005: Copy-on-Write Draft Version N+1
        const nextVersion = this._version + 1;
        return new SurveyEntity({
            projectId: this.projectId,
            surveyId: this.surveyId,
            version: nextVersion,
            title: { ...this._title },
            description: this._description ? { ...this._description } : undefined,
            status: 'DRAFT',
            pages: JSON.parse(JSON.stringify(this._pages)),
            publishedAt: null,
            versionHistory: [...this._versionHistory],
            isDeleted: false,
        });
    }
    markAsDeleted() {
        this._isDeleted = true;
        this._status = 'ARCHIVED';
        this._updatedAt = new Date();
    }
    toJSON() {
        return {
            projectId: this.projectId,
            surveyId: this.surveyId,
            version: this._version,
            title: this._title,
            description: this._description,
            status: this._status,
            pages: this._pages,
            publishedAt: this._publishedAt,
            versionHistory: this._versionHistory,
            isDeleted: this._isDeleted,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.SurveyEntity = SurveyEntity;
//# sourceMappingURL=survey.entity.js.map