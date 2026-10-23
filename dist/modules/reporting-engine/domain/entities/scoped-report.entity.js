"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopedReportEntity = void 0;
class ScopedReportEntity {
    static REPORT_ID_REGEX = /^RPT-[A-Za-z0-9_-]{4,40}$/;
    reportId;
    projectId;
    campaignId;
    surveyId;
    title;
    scopeType;
    scopeFilter;
    format;
    includeAiSentimentSummary;
    includeBenchmarkComparison;
    passwordProtected;
    pdfPassword;
    _status;
    _downloadUrl;
    _fileSizeBytes;
    _sampleSize;
    _isSuppressed;
    _suppressionNotice;
    requestedBy;
    createdAt;
    _completedAt;
    constructor(props) {
        if (!props.reportId || !ScopedReportEntity.REPORT_ID_REGEX.test(props.reportId)) {
            throw new Error(`Invalid reportId format '${props.reportId}'. Expected ^RPT-[A-Za-z0-9_-]{4,40}$`);
        }
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required');
        }
        if (!props.title || props.title.trim().length === 0) {
            throw new Error('Report title is required');
        }
        const validScopes = ['ORGANIZATION', 'DEPARTMENT', 'DEMOGRAPHIC_SEGMENT', 'BUSINESS_UNIT'];
        if (!validScopes.includes(props.scopeType)) {
            throw new Error(`Invalid scopeType '${props.scopeType}'. Supported: ${validScopes.join(', ')}`);
        }
        const validFormats = ['PDF', 'EXCEL', 'POWERPOINT', 'WEB'];
        if (!validFormats.includes(props.format)) {
            throw new Error(`Invalid format '${props.format}'. Supported: ${validFormats.join(', ')}`);
        }
        this.reportId = props.reportId;
        this.projectId = props.projectId.trim().toUpperCase();
        this.campaignId = props.campaignId;
        this.surveyId = props.surveyId;
        this.title = props.title.trim();
        this.scopeType = props.scopeType;
        this.scopeFilter = props.scopeFilter ? { ...props.scopeFilter } : undefined;
        this.format = props.format;
        this.includeAiSentimentSummary = props.includeAiSentimentSummary ?? true;
        this.includeBenchmarkComparison = props.includeBenchmarkComparison ?? true;
        this.passwordProtected = props.passwordProtected ?? false;
        this.pdfPassword = props.pdfPassword;
        this._status = props.status || 'PENDING';
        this._downloadUrl = props.downloadUrl;
        this._fileSizeBytes = props.fileSizeBytes;
        this._sampleSize = props.sampleSize;
        this._isSuppressed = props.isSuppressed ?? false;
        this._suppressionNotice = props.suppressionNotice;
        this.requestedBy = props.requestedBy;
        this.createdAt = props.createdAt || new Date();
        this._completedAt = props.completedAt;
    }
    get status() {
        return this._status;
    }
    get downloadUrl() {
        return this._downloadUrl;
    }
    get fileSizeBytes() {
        return this._fileSizeBytes;
    }
    get sampleSize() {
        return this._sampleSize;
    }
    get isSuppressed() {
        return this._isSuppressed;
    }
    get suppressionNotice() {
        return this._suppressionNotice;
    }
    get completedAt() {
        return this._completedAt;
    }
    complete(downloadUrl, fileSizeBytes, sampleSize, isSuppressed, suppressionNotice) {
        this._status = 'COMPLETED';
        this._downloadUrl = downloadUrl;
        this._fileSizeBytes = fileSizeBytes;
        this._sampleSize = sampleSize;
        this._isSuppressed = isSuppressed ?? false;
        this._suppressionNotice = suppressionNotice;
        this._completedAt = new Date();
    }
    fail(reason) {
        this._status = 'FAILED';
        this._suppressionNotice = reason;
        this._completedAt = new Date();
    }
    toJSON() {
        return {
            reportId: this.reportId,
            projectId: this.projectId,
            campaignId: this.campaignId,
            surveyId: this.surveyId,
            title: this.title,
            scopeType: this.scopeType,
            scopeFilter: this.scopeFilter,
            format: this.format,
            includeAiSentimentSummary: this.includeAiSentimentSummary,
            includeBenchmarkComparison: this.includeBenchmarkComparison,
            passwordProtected: this.passwordProtected,
            pdfPassword: this.pdfPassword,
            status: this._status,
            downloadUrl: this._downloadUrl,
            fileSizeBytes: this._fileSizeBytes,
            sampleSize: this._sampleSize,
            isSuppressed: this._isSuppressed,
            suppressionNotice: this._suppressionNotice,
            requestedBy: this.requestedBy,
            createdAt: this.createdAt,
            completedAt: this._completedAt,
        };
    }
}
exports.ScopedReportEntity = ScopedReportEntity;
//# sourceMappingURL=scoped-report.entity.js.map