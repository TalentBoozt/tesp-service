"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStylesRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const answer_key_v1_definition_1 = require("../../../domain/constants/answer-key-v1.definition");
const questionnaire_v1_definition_1 = require("../../../domain/constants/questionnaire-v1.definition");
const style_interpretations_definition_1 = require("../../../domain/constants/style-interpretations.definition");
const social_styles_schemas_1 = require("./social-styles.schemas");
/**
 * Unified repository for all 7 Social Styles collections.
 * Supports both live MongoDB (Mongoose) and an atomic in-memory engine when MongoDB is disconnected
 * so unit, integration, and high-concurrency tests run deterministically in any environment.
 */
class SocialStylesRepository {
    static STALE_LOCK_TIMEOUT_MS = 30_000;
    // Shared in-memory stores used when mongoose.connection.readyState !== 1
    static sharedAssessments = new Map();
    static sharedResponses = new Map();
    static sharedResults = new Map();
    static sharedReports = new Map();
    static sharedUsageEvents = new Map();
    static sharedIdempotencyIndex = new Map(); // idempotencyKey -> eventId
    static sharedFirstExportLockIndex = new Map(); // firstExportLockKey -> eventId
    static sharedConsultantSettings = new Map();
    static sharedQrSessions = new Map();
    static sharedInterpretationCatalog = JSON.parse(JSON.stringify(style_interpretations_definition_1.DEFAULT_INTERPRETATION_TEMPLATES_V1));
    // Fault-injection hooks for testing partial failure recovery (Section 4.1 & 9.4)
    static sharedFailNextLedgerInsertCount = 0;
    static sharedFailNextReportSaveCount = 0;
    get assessments() {
        return SocialStylesRepository.sharedAssessments;
    }
    get responses() {
        return SocialStylesRepository.sharedResponses;
    }
    get results() {
        return SocialStylesRepository.sharedResults;
    }
    get reports() {
        return SocialStylesRepository.sharedReports;
    }
    get usageEvents() {
        return SocialStylesRepository.sharedUsageEvents;
    }
    get idempotencyIndex() {
        return SocialStylesRepository.sharedIdempotencyIndex;
    }
    get firstExportLockIndex() {
        return SocialStylesRepository.sharedFirstExportLockIndex;
    }
    get consultantSettings() {
        return SocialStylesRepository.sharedConsultantSettings;
    }
    get qrSessions() {
        return SocialStylesRepository.sharedQrSessions;
    }
    get interpretationCatalog() {
        return SocialStylesRepository.sharedInterpretationCatalog;
    }
    set interpretationCatalog(val) {
        SocialStylesRepository.sharedInterpretationCatalog = val;
    }
    get failNextLedgerInsertCount() {
        return SocialStylesRepository.sharedFailNextLedgerInsertCount;
    }
    set failNextLedgerInsertCount(val) {
        SocialStylesRepository.sharedFailNextLedgerInsertCount = val;
    }
    get failNextReportSaveCount() {
        return SocialStylesRepository.sharedFailNextReportSaveCount;
    }
    set failNextReportSaveCount(val) {
        SocialStylesRepository.sharedFailNextReportSaveCount = val;
    }
    get isMongoConnected() {
        return mongoose_1.default.connection?.readyState === 1;
    }
    clearMemoryStores() {
        SocialStylesRepository.sharedAssessments.clear();
        SocialStylesRepository.sharedResponses.clear();
        SocialStylesRepository.sharedResults.clear();
        SocialStylesRepository.sharedReports.clear();
        SocialStylesRepository.sharedUsageEvents.clear();
        SocialStylesRepository.sharedIdempotencyIndex.clear();
        SocialStylesRepository.sharedFirstExportLockIndex.clear();
        SocialStylesRepository.sharedConsultantSettings.clear();
        SocialStylesRepository.sharedQrSessions.clear();
        SocialStylesRepository.sharedInterpretationCatalog = JSON.parse(JSON.stringify(style_interpretations_definition_1.DEFAULT_INTERPRETATION_TEMPLATES_V1));
        SocialStylesRepository.sharedFailNextLedgerInsertCount = 0;
        SocialStylesRepository.sharedFailNextReportSaveCount = 0;
    }
    injectFaultNextLedgerInsert(count = 1) {
        this.failNextLedgerInsertCount = count;
    }
    setSimulateLedgerFailureOnce(enabled) {
        this.failNextLedgerInsertCount = enabled ? 1 : 0;
    }
    injectFaultNextReportSave(count = 1) {
        this.failNextReportSaveCount = count;
    }
    setSimulateReportSaveFailureOnce(enabled) {
        this.failNextReportSaveCount = enabled ? 1 : 0;
    }
    // ==========================================================================
    // 1. Assessments
    // ==========================================================================
    async createAssessment(record) {
        const now = new Date();
        const full = {
            ...record,
            createdAt: now,
            updatedAt: now,
        };
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.create(full);
            return this.mapAssessmentDoc(doc);
        }
        if (this.assessments.has(full.assessmentId)) {
            throw new Error(`Duplicate assessmentId: ${full.assessmentId}`);
        }
        if (full.publicTokenHash) {
            for (const existing of this.assessments.values()) {
                if (existing.publicTokenHash === full.publicTokenHash) {
                    throw new Error('Duplicate publicTokenHash');
                }
            }
        }
        this.assessments.set(full.assessmentId, { ...full });
        return { ...full };
    }
    async findAssessmentById(assessmentId, consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = { assessmentId };
            if (consultantIdScope) {
                filter.consultantId = consultantIdScope;
            }
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.findOne(filter).lean();
            return doc ? this.mapAssessmentDoc(doc) : null;
        }
        const item = this.assessments.get(assessmentId);
        if (!item)
            return null;
        if (consultantIdScope && item.consultantId !== consultantIdScope) {
            return null;
        }
        return { ...item };
    }
    async findAssessmentByPublicTokenHash(publicTokenHash) {
        if (!publicTokenHash)
            return null;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.findOne({ publicTokenHash }).lean();
            return doc ? this.mapAssessmentDoc(doc) : null;
        }
        for (const item of this.assessments.values()) {
            if (item.publicTokenHash === publicTokenHash) {
                return { ...item };
            }
        }
        return null;
    }
    async updateAssessment(assessmentId, updates, consultantIdScope) {
        const now = new Date();
        if (this.isMongoConnected) {
            const filter = { assessmentId };
            if (consultantIdScope) {
                filter.consultantId = consultantIdScope;
            }
            const setPayload = { ...updates, updatedAt: now };
            const unsetPayload = {};
            if ('publicTokenHash' in updates && !updates.publicTokenHash) {
                delete setPayload.publicTokenHash;
                unsetPayload.publicTokenHash = 1;
            }
            const updateOp = { $set: setPayload };
            if (Object.keys(unsetPayload).length > 0) {
                updateOp.$unset = unsetPayload;
            }
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.findOneAndUpdate(filter, updateOp, {
                new: true,
            }).lean();
            return doc ? this.mapAssessmentDoc(doc) : null;
        }
        const existing = this.assessments.get(assessmentId);
        if (!existing)
            return null;
        if (consultantIdScope && existing.consultantId !== consultantIdScope) {
            return null;
        }
        const updated = {
            ...existing,
            ...updates,
            updatedAt: now,
        };
        if ('publicTokenHash' in updates && !updates.publicTokenHash) {
            delete updated.publicTokenHash;
        }
        this.assessments.set(assessmentId, updated);
        return { ...updated };
    }
    /**
     * Atomic Compare-And-Swap (CAS) for final respondent submission.
     * Guarantees that concurrent submit requests cannot double-submit the same assessment.
     */
    async claimAssessmentSubmissionAtomic(assessmentId, publicTokenHash, selectedLanguage, completedAt = new Date()) {
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.findOneAndUpdate({
                assessmentId,
                publicTokenHash,
                status: { $in: ['INVITED', 'IN_PROGRESS', 'REOPENED'] },
            }, {
                $set: {
                    status: 'COMPLETED',
                    language: selectedLanguage,
                    completedAt,
                    encryptedPublicToken: null,
                    updatedAt: completedAt,
                },
            }, { new: true }).lean();
            return doc ? this.mapAssessmentDoc(doc) : null;
        }
        const existing = this.assessments.get(assessmentId);
        if (!existing)
            return null;
        if (existing.publicTokenHash !== publicTokenHash)
            return null;
        if (!['INVITED', 'IN_PROGRESS', 'REOPENED'].includes(existing.status)) {
            return null;
        }
        const updated = {
            ...existing,
            status: 'COMPLETED',
            language: selectedLanguage,
            completedAt,
            encryptedPublicToken: null,
            updatedAt: completedAt,
        };
        this.assessments.set(assessmentId, updated);
        return { ...updated };
    }
    /**
     * Recoverable two-phase atomic claim for FIRST_EXPORT_ONLY billing.
     *
     * 1. First checks if a committed billable usage event ('FIRST_BILLABLE:<assessmentId>') already exists in the ledger.
     *    If so, reconciles the assessment lock state to 'COMMITTED' and returns { wonFirstExport: false }.
     * 2. Otherwise, atomically claims the assessment's firstBillableExportId in 'PENDING_LEDGER' state
     *    (including reclaiming stale 'PENDING_LEDGER' locks older than 30s if no ledger entry exists).
     */
    async claimFirstBillableExportSlotAtomic(assessmentId, candidateEventId, now = new Date()) {
        const firstLockKey = `FIRST_BILLABLE:${assessmentId}`;
        const existingLedgerEvent = await this.findUsageEventByFirstExportLockKey(firstLockKey);
        if (existingLedgerEvent) {
            // Reconcile assessment if it was left in PENDING_LEDGER
            await this.commitFirstBillableExportSlot(assessmentId, existingLedgerEvent.eventId, existingLedgerEvent.createdAt, false);
            return { wonFirstExport: false };
        }
        const staleCutoff = new Date(now.getTime() - SocialStylesRepository.STALE_LOCK_TIMEOUT_MS);
        if (this.isMongoConnected) {
            const claimed = await social_styles_schemas_1.SocialStyleAssessmentModel.findOneAndUpdate({
                assessmentId,
                status: { $in: ['COMPLETED', 'REVIEWED'] },
                $or: [
                    { firstBillableExportId: null },
                    { firstBillableLockState: 'NONE' },
                    {
                        firstBillableLockState: 'PENDING_LEDGER',
                        firstBillableLockedAt: { $lte: staleCutoff },
                    },
                ],
            }, {
                $set: {
                    firstBillableExportId: candidateEventId,
                    firstBillableLockState: 'PENDING_LEDGER',
                    firstBillableLockedAt: now,
                    updatedAt: now,
                },
            }, { new: true }).lean();
            return { wonFirstExport: Boolean(claimed) };
        }
        const existing = this.assessments.get(assessmentId);
        if (!existing || !['COMPLETED', 'REVIEWED'].includes(existing.status)) {
            return { wonFirstExport: false };
        }
        const isUnlocked = !existing.firstBillableExportId || existing.firstBillableLockState === 'NONE';
        const isStalePending = existing.firstBillableLockState === 'PENDING_LEDGER' &&
            existing.firstBillableLockedAt &&
            existing.firstBillableLockedAt.getTime() <= staleCutoff.getTime();
        if (!isUnlocked && !isStalePending) {
            return { wonFirstExport: false };
        }
        existing.firstBillableExportId = candidateEventId;
        existing.firstBillableLockState = 'PENDING_LEDGER';
        existing.firstBillableLockedAt = now;
        existing.updatedAt = now;
        this.assessments.set(assessmentId, { ...existing });
        return { wonFirstExport: true };
    }
    /**
     * Commits the first-export lock after the usage ledger record is durably persisted.
     */
    async commitFirstBillableExportSlot(assessmentId, eventId, exportedAt = new Date(), incrementCounters = true) {
        if (this.isMongoConnected) {
            const updateOp = {
                $set: {
                    firstBillableExportId: eventId,
                    firstBillableLockState: 'COMMITTED',
                    firstExportedAt: exportedAt,
                    lastReportExportedAt: exportedAt,
                    updatedAt: exportedAt,
                },
            };
            if (incrementCounters) {
                updateOp.$inc = {
                    reportExportCount: 1,
                    billableExportCount: 1,
                };
            }
            await social_styles_schemas_1.SocialStyleAssessmentModel.updateOne({ assessmentId }, updateOp);
            return;
        }
        const existing = this.assessments.get(assessmentId);
        if (!existing)
            return;
        existing.firstBillableExportId = eventId;
        existing.firstBillableLockState = 'COMMITTED';
        existing.firstExportedAt = existing.firstExportedAt || exportedAt;
        existing.lastReportExportedAt = exportedAt;
        if (incrementCounters) {
            existing.reportExportCount += 1;
            existing.billableExportCount += 1;
        }
        existing.updatedAt = exportedAt;
        this.assessments.set(assessmentId, { ...existing });
    }
    /**
     * Compensating rollback: releases a PENDING_LEDGER lock if usage-ledger insertion fails,
     * ensuring the assessment is NEVER permanently locked without a billable usage record.
     */
    async releaseFirstBillableExportSlotOnFailure(assessmentId, candidateEventId) {
        if (this.isMongoConnected) {
            await social_styles_schemas_1.SocialStyleAssessmentModel.updateOne({
                assessmentId,
                firstBillableExportId: candidateEventId,
                firstBillableLockState: 'PENDING_LEDGER',
            }, {
                $set: {
                    firstBillableExportId: null,
                    firstBillableLockState: 'NONE',
                    firstBillableLockedAt: null,
                    updatedAt: new Date(),
                },
            });
            return;
        }
        const existing = this.assessments.get(assessmentId);
        if (existing &&
            existing.firstBillableExportId === candidateEventId &&
            existing.firstBillableLockState === 'PENDING_LEDGER') {
            existing.firstBillableExportId = null;
            existing.firstBillableLockState = 'NONE';
            existing.firstBillableLockedAt = null;
            existing.updatedAt = new Date();
            this.assessments.set(assessmentId, { ...existing });
        }
    }
    async incrementNonBillableExportCount(assessmentId, exportedAt = new Date(), alsoIncrementBillable = false) {
        if (this.isMongoConnected) {
            await social_styles_schemas_1.SocialStyleAssessmentModel.updateOne({ assessmentId }, {
                $set: { lastReportExportedAt: exportedAt, updatedAt: exportedAt },
                $inc: {
                    reportExportCount: 1,
                    ...(alsoIncrementBillable ? { billableExportCount: 1 } : {}),
                },
            });
            return;
        }
        const existing = this.assessments.get(assessmentId);
        if (!existing)
            return;
        existing.lastReportExportedAt = exportedAt;
        existing.reportExportCount += 1;
        if (alsoIncrementBillable) {
            existing.billableExportCount += 1;
        }
        existing.updatedAt = exportedAt;
        this.assessments.set(assessmentId, { ...existing });
    }
    async listAssessments(filter) {
        const page = Math.max(1, filter.page || 1);
        const limit = Math.min(100, Math.max(1, filter.limit || 20));
        const skip = (page - 1) * limit;
        if (this.isMongoConnected) {
            const query = {};
            if (filter.consultantId)
                query.consultantId = filter.consultantId;
            if (filter.firmId)
                query.firmId = filter.firmId;
            if (filter.status && filter.status !== 'ALL')
                query.status = filter.status;
            if (filter.language && filter.language !== 'ALL')
                query.language = filter.language;
            if (filter.qrSessionId)
                query.qrSessionId = filter.qrSessionId;
            if (filter.batchId)
                query.batchId = filter.batchId;
            if (filter.exportedFilter === 'EXPORTED')
                query.reportExportCount = { $gt: 0 };
            if (filter.exportedFilter === 'NOT_EXPORTED')
                query.reportExportCount = 0;
            if (filter.search) {
                const regex = { $regex: filter.search.trim(), $options: 'i' };
                query.$or = [
                    { participantName: regex },
                    { participantEmail: regex },
                    { organizationName: regex },
                    { reference: regex },
                    { title: regex },
                    { assessmentId: regex },
                    { qrSessionId: regex },
                    { batchId: regex },
                ];
            }
            const sortField = filter.sortBy || 'createdAt';
            const sortDir = filter.sortOrder === 'asc' ? 1 : -1;
            const [total, docs] = await Promise.all([
                social_styles_schemas_1.SocialStyleAssessmentModel.countDocuments(query),
                social_styles_schemas_1.SocialStyleAssessmentModel.find(query)
                    .sort({ [sortField]: sortDir })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            return {
                total,
                data: docs.map((d) => this.mapAssessmentDoc(d)),
            };
        }
        let items = Array.from(this.assessments.values());
        if (filter.consultantId) {
            items = items.filter((a) => a.consultantId === filter.consultantId);
        }
        if (filter.firmId) {
            items = items.filter((a) => a.firmId === filter.firmId);
        }
        if (filter.status && filter.status !== 'ALL') {
            items = items.filter((a) => a.status === filter.status);
        }
        if (filter.language && filter.language !== 'ALL') {
            items = items.filter((a) => a.language === filter.language);
        }
        if (filter.qrSessionId) {
            items = items.filter((a) => a.qrSessionId === filter.qrSessionId);
        }
        if (filter.batchId) {
            items = items.filter((a) => a.batchId === filter.batchId);
        }
        if (filter.exportedFilter === 'EXPORTED') {
            items = items.filter((a) => a.reportExportCount > 0);
        }
        else if (filter.exportedFilter === 'NOT_EXPORTED') {
            items = items.filter((a) => a.reportExportCount === 0);
        }
        if (filter.search) {
            const q = filter.search.trim().toLowerCase();
            items = items.filter((a) => a.participantName.toLowerCase().includes(q) ||
                a.participantEmail.toLowerCase().includes(q) ||
                (a.organizationName || '').toLowerCase().includes(q) ||
                (a.reference || '').toLowerCase().includes(q) ||
                (a.title || '').toLowerCase().includes(q) ||
                a.assessmentId.toLowerCase().includes(q) ||
                (a.qrSessionId || '').toLowerCase().includes(q) ||
                (a.batchId || '').toLowerCase().includes(q));
        }
        const sortField = filter.sortBy || 'createdAt';
        const sortMult = filter.sortOrder === 'asc' ? 1 : -1;
        items.sort((a, b) => {
            const valA = a[sortField] ?? '';
            const valB = b[sortField] ?? '';
            if (valA < valB)
                return -1 * sortMult;
            if (valA > valB)
                return 1 * sortMult;
            return 0;
        });
        return {
            total: items.length,
            data: items.slice(skip, skip + limit).map((i) => ({ ...i })),
        };
    }
    async getAllAssessmentsForScope(consultantId) {
        if (this.isMongoConnected) {
            const query = consultantId ? { consultantId } : {};
            const docs = await social_styles_schemas_1.SocialStyleAssessmentModel.find(query).lean();
            return docs.map((d) => this.mapAssessmentDoc(d));
        }
        const all = Array.from(this.assessments.values());
        return consultantId ? all.filter((a) => a.consultantId === consultantId) : all;
    }
    // ==========================================================================
    // 2. Responses
    // ==========================================================================
    async findResponseByAssessmentId(assessmentId) {
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleResponseModel.findOne({ assessmentId }).lean();
            return doc ? this.mapResponseDoc(doc) : null;
        }
        const r = this.responses.get(assessmentId);
        return r ? { ...r, draftAnswers: [...r.draftAnswers], answers: [...r.answers] } : null;
    }
    async saveDraftProgress(params) {
        const now = new Date();
        const existing = await this.findResponseByAssessmentId(params.assessmentId);
        if (existing && existing.isSubmitted) {
            throw new Error('Cannot modify draft answers after final submission.');
        }
        const responseId = existing?.responseId || `SSRSP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleResponseModel.findOneAndUpdate({ assessmentId: params.assessmentId, isSubmitted: { $ne: true } }, {
                $set: {
                    consultantId: params.consultantId,
                    questionnaireVersion: params.questionnaireVersion,
                    selectedLanguage: params.selectedLanguage,
                    draftAnswers: params.draftAnswers,
                    lastSavedAt: now,
                    ...(params.respondentUserAgent
                        ? { respondentUserAgent: params.respondentUserAgent }
                        : {}),
                },
                $setOnInsert: {
                    responseId,
                    assessmentId: params.assessmentId,
                    answers: [],
                    isSubmitted: false,
                },
            }, { upsert: true, new: true }).lean();
            return this.mapResponseDoc(doc);
        }
        const record = {
            responseId,
            assessmentId: params.assessmentId,
            consultantId: params.consultantId,
            questionnaireVersion: params.questionnaireVersion,
            selectedLanguage: params.selectedLanguage,
            draftAnswers: params.draftAnswers.map((a) => ({ ...a })),
            answers: [],
            isSubmitted: false,
            lastSavedAt: now,
            submittedAt: null,
            respondentUserAgent: params.respondentUserAgent,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        };
        this.responses.set(params.assessmentId, record);
        return { ...record };
    }
    async saveSubmittedResponse(params) {
        const existing = await this.findResponseByAssessmentId(params.assessmentId);
        const responseId = existing?.responseId || `SSRSP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleResponseModel.findOneAndUpdate({ assessmentId: params.assessmentId }, {
                $set: {
                    consultantId: params.consultantId,
                    questionnaireVersion: params.questionnaireVersion,
                    selectedLanguage: params.selectedLanguage,
                    draftAnswers: params.answers,
                    answers: params.answers,
                    isSubmitted: true,
                    lastSavedAt: params.submittedAt,
                    submittedAt: params.submittedAt,
                    ...(params.respondentUserAgent
                        ? { respondentUserAgent: params.respondentUserAgent }
                        : {}),
                },
                $setOnInsert: {
                    responseId,
                    assessmentId: params.assessmentId,
                },
            }, { upsert: true, new: true }).lean();
            return this.mapResponseDoc(doc);
        }
        const record = {
            responseId,
            assessmentId: params.assessmentId,
            consultantId: params.consultantId,
            questionnaireVersion: params.questionnaireVersion,
            selectedLanguage: params.selectedLanguage,
            draftAnswers: params.answers.map((a) => ({ ...a })),
            answers: params.answers.map((a) => ({ ...a })),
            isSubmitted: true,
            lastSavedAt: params.submittedAt,
            submittedAt: params.submittedAt,
            respondentUserAgent: params.respondentUserAgent,
            createdAt: existing?.createdAt || params.submittedAt,
            updatedAt: params.submittedAt,
        };
        this.responses.set(params.assessmentId, record);
        return { ...record };
    }
    // ==========================================================================
    // 3. Results
    // ==========================================================================
    async saveResult(record) {
        const now = new Date();
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleResultModel.findOneAndUpdate({ assessmentId: record.assessmentId }, { $set: { ...record, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true, new: true }).lean();
            return this.mapResultDoc(doc);
        }
        const full = {
            ...record,
            createdAt: now,
            updatedAt: now,
        };
        this.results.set(record.assessmentId, full);
        return { ...full };
    }
    async findResultByAssessmentId(assessmentId, consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = { assessmentId };
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const doc = await social_styles_schemas_1.SocialStyleResultModel.findOne(filter).lean();
            return doc ? this.mapResultDoc(doc) : null;
        }
        const res = this.results.get(assessmentId);
        if (!res)
            return null;
        if (consultantIdScope && res.consultantId !== consultantIdScope)
            return null;
        return { ...res };
    }
    // ==========================================================================
    // 4. Reports
    // ==========================================================================
    async saveReport(record) {
        if (this.failNextReportSaveCount > 0) {
            this.failNextReportSaveCount -= 1;
            throw new Error('SIMULATED_REPORT_PERSISTENCE_FAILURE');
        }
        const now = new Date();
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleReportModel.create({
                ...record,
                createdAt: now,
                updatedAt: now,
            });
            return this.mapReportDoc(doc);
        }
        const full = {
            ...record,
            createdAt: now,
            updatedAt: now,
        };
        this.reports.set(record.reportId, full);
        return { ...full };
    }
    async deleteReportById(reportId) {
        if (this.isMongoConnected) {
            await social_styles_schemas_1.SocialStyleReportModel.deleteOne({ reportId });
            return;
        }
        this.reports.delete(reportId);
    }
    async findReportById(reportId, consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = { reportId };
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const doc = await social_styles_schemas_1.SocialStyleReportModel.findOne(filter).lean();
            return doc ? this.mapReportDoc(doc) : null;
        }
        const r = this.reports.get(reportId);
        if (!r)
            return null;
        if (consultantIdScope && r.consultantId !== consultantIdScope)
            return null;
        return { ...r };
    }
    async listReportsByAssessmentId(assessmentId, consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = { assessmentId };
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const docs = await social_styles_schemas_1.SocialStyleReportModel.find(filter).sort({ generatedAt: -1 }).lean();
            return docs.map((d) => this.mapReportDoc(d));
        }
        return Array.from(this.reports.values())
            .filter((r) => r.assessmentId === assessmentId &&
            (!consultantIdScope || r.consultantId === consultantIdScope))
            .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    }
    async listReportsForConsultant(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        if (this.isMongoConnected) {
            const filter = {};
            if (params.consultantId)
                filter.consultantId = params.consultantId;
            if (params.assessmentId)
                filter.assessmentId = params.assessmentId;
            const [total, docs] = await Promise.all([
                social_styles_schemas_1.SocialStyleReportModel.countDocuments(filter),
                social_styles_schemas_1.SocialStyleReportModel.find(filter)
                    .sort({ generatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            return { total, data: docs.map((d) => this.mapReportDoc(d)) };
        }
        let items = Array.from(this.reports.values());
        if (params.consultantId) {
            items = items.filter((r) => r.consultantId === params.consultantId);
        }
        if (params.assessmentId) {
            items = items.filter((r) => r.assessmentId === params.assessmentId);
        }
        items.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
        return {
            total: items.length,
            data: items.slice(skip, skip + limit),
        };
    }
    // ==========================================================================
    // 5. Usage Events (Immutable Commercial Ledger)
    // ==========================================================================
    async findUsageEventByIdempotencyKey(idempotencyKey) {
        if (!idempotencyKey)
            return null;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleUsageEventModel.findOne({ idempotencyKey }).lean();
            return doc ? this.mapUsageEventDoc(doc) : null;
        }
        const eventId = this.idempotencyIndex.get(idempotencyKey);
        if (!eventId)
            return null;
        return this.usageEvents.get(eventId) || null;
    }
    async findUsageEventByFirstExportLockKey(firstExportLockKey) {
        if (!firstExportLockKey)
            return null;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleUsageEventModel.findOne({ firstExportLockKey }).lean();
            return doc ? this.mapUsageEventDoc(doc) : null;
        }
        const eventId = this.firstExportLockIndex.get(firstExportLockKey);
        if (!eventId)
            return null;
        return this.usageEvents.get(eventId) || null;
    }
    async recordUsageEvent(event) {
        if (this.failNextLedgerInsertCount > 0) {
            this.failNextLedgerInsertCount -= 1;
            throw new Error('SIMULATED_LEDGER_INSERT_FAILURE');
        }
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleUsageEventModel.create(event);
            return this.mapUsageEventDoc(doc);
        }
        if (this.idempotencyIndex.has(event.idempotencyKey)) {
            const err = new Error('E11000 duplicate key error on idempotencyKey');
            err.code = 11000;
            err.keyPattern = { idempotencyKey: 1 };
            throw err;
        }
        if (event.firstExportLockKey && this.firstExportLockIndex.has(event.firstExportLockKey)) {
            const err = new Error('E11000 duplicate key error on firstExportLockKey');
            err.code = 11000;
            err.keyPattern = { firstExportLockKey: 1 };
            throw err;
        }
        this.usageEvents.set(event.eventId, { ...event });
        this.idempotencyIndex.set(event.idempotencyKey, event.eventId);
        if (event.firstExportLockKey) {
            this.firstExportLockIndex.set(event.firstExportLockKey, event.eventId);
        }
        return { ...event };
    }
    async listUsageEvents(filter) {
        const page = Math.max(1, filter.page || 1);
        const limit = Math.min(200, Math.max(1, filter.limit || 20));
        const skip = (page - 1) * limit;
        if (this.isMongoConnected) {
            const query = this.buildUsageFilterQuery(filter);
            const [total, docs] = await Promise.all([
                social_styles_schemas_1.SocialStyleUsageEventModel.countDocuments(query),
                social_styles_schemas_1.SocialStyleUsageEventModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            return { total, data: docs.map((d) => this.mapUsageEventDoc(d)) };
        }
        const items = this.filterInMemoryUsageEvents(filter);
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return {
            total: items.length,
            data: items.slice(skip, skip + limit),
        };
    }
    async getAllUsageEventsMatching(filter) {
        if (this.isMongoConnected) {
            const query = this.buildUsageFilterQuery(filter);
            const docs = await social_styles_schemas_1.SocialStyleUsageEventModel.find(query).sort({ createdAt: -1 }).lean();
            return docs.map((d) => this.mapUsageEventDoc(d));
        }
        const items = this.filterInMemoryUsageEvents(filter);
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return items;
    }
    buildUsageFilterQuery(filter) {
        const query = {};
        if (filter.consultantId)
            query.consultantId = filter.consultantId;
        if (filter.firmId)
            query.firmId = filter.firmId;
        if (filter.assessmentId)
            query.assessmentId = filter.assessmentId;
        if (filter.billingPeriod)
            query.billingPeriod = filter.billingPeriod;
        if (filter.billingQuarter)
            query.billingQuarter = filter.billingQuarter;
        if (filter.billableOnly === true)
            query.billable = true;
        if (filter.startDate || filter.endDate) {
            query.createdAt = {};
            if (filter.startDate)
                query.createdAt.$gte = filter.startDate;
            if (filter.endDate)
                query.createdAt.$lte = filter.endDate;
        }
        return query;
    }
    filterInMemoryUsageEvents(filter) {
        let items = Array.from(this.usageEvents.values());
        if (filter.consultantId)
            items = items.filter((e) => e.consultantId === filter.consultantId);
        if (filter.firmId)
            items = items.filter((e) => e.firmId === filter.firmId);
        if (filter.assessmentId)
            items = items.filter((e) => e.assessmentId === filter.assessmentId);
        if (filter.billingPeriod)
            items = items.filter((e) => e.billingPeriod === filter.billingPeriod);
        if (filter.billingQuarter)
            items = items.filter((e) => e.billingQuarter === filter.billingQuarter);
        if (filter.billableOnly === true)
            items = items.filter((e) => e.billable === true);
        if (filter.startDate) {
            items = items.filter((e) => e.createdAt.getTime() >= filter.startDate.getTime());
        }
        if (filter.endDate) {
            items = items.filter((e) => e.createdAt.getTime() <= filter.endDate.getTime());
        }
        return items;
    }
    // ==========================================================================
    // 6. Questionnaire & Interpretation Templates
    // ==========================================================================
    async getInterpretationTemplates(version = answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION) {
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleQuestionnaireModel.findOne({ version }).lean();
            if (doc && doc.interpretationTemplates) {
                return doc.interpretationTemplates;
            }
            // Seed default v1.0 document if not yet persisted
            await social_styles_schemas_1.SocialStyleQuestionnaireModel.findOneAndUpdate({ version: answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION }, {
                $setOnInsert: {
                    version: answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION,
                    status: 'ACTIVE',
                    supportedLanguages: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.supportedLanguages,
                    translationMetadata: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.translationMetadata,
                    instructions: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.instructions,
                    questions: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.questions,
                    answerKey: [...answer_key_v1_definition_1.ANSWER_KEY_V1_ROWS],
                    scoringRules: {
                        pointsPerQuestion: 1,
                        rawScoreMultiplier: 5,
                        expectedTotalRaw: 20,
                        expectedTotalFinal: 100,
                    },
                    interpretationTemplates: style_interpretations_definition_1.DEFAULT_INTERPRETATION_TEMPLATES_V1,
                    updatedBy: 'SYSTEM_SEEDER',
                },
            }, { upsert: true, new: true });
            return JSON.parse(JSON.stringify(style_interpretations_definition_1.DEFAULT_INTERPRETATION_TEMPLATES_V1));
        }
        return JSON.parse(JSON.stringify(this.interpretationCatalog));
    }
    async updateInterpretationTemplates(catalog, updatedBy) {
        const updatedCatalog = {
            ...catalog,
            updatedAt: new Date().toISOString(),
            updatedBy,
        };
        if (this.isMongoConnected) {
            await social_styles_schemas_1.SocialStyleQuestionnaireModel.findOneAndUpdate({ version: answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION }, {
                $set: {
                    interpretationTemplates: updatedCatalog,
                    updatedBy,
                },
                $setOnInsert: {
                    status: 'ACTIVE',
                    supportedLanguages: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.supportedLanguages,
                    translationMetadata: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.translationMetadata,
                    instructions: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.instructions,
                    questions: questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION.questions,
                    answerKey: [...answer_key_v1_definition_1.ANSWER_KEY_V1_ROWS],
                },
            }, { upsert: true, new: true });
        }
        this.interpretationCatalog = JSON.parse(JSON.stringify(updatedCatalog));
        return JSON.parse(JSON.stringify(updatedCatalog));
    }
    // ==========================================================================
    // 7. Consultant Settings
    // ==========================================================================
    async getConsultantSettings(consultantId) {
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleConsultantSettingsModel.findOne({ consultantId }).lean();
            if (doc) {
                return this.mapConsultantSettingsDoc(doc);
            }
        }
        const existing = this.consultantSettings.get(consultantId);
        if (existing)
            return { ...existing };
        const now = new Date();
        return {
            consultantId,
            moduleEnabled: true,
            suspensionReason: null,
            suspendedAt: null,
            suspendedBy: null,
            chargingPolicy: 'FIRST_EXPORT_ONLY',
            monthlyReportQuota: null,
            lifetimeReportQuota: null,
            prepaidCreditsBalance: 0,
            createdAt: now,
            updatedAt: now,
        };
    }
    async upsertConsultantSettings(consultantId, updates, updatedBy) {
        const now = new Date();
        const current = await this.getConsultantSettings(consultantId);
        const next = {
            ...current,
            ...updates,
            consultantId,
            updatedBy,
            updatedAt: now,
        };
        if (updates.moduleEnabled === false && current.moduleEnabled !== false) {
            next.suspendedAt = now;
            next.suspendedBy = updatedBy;
        }
        else if (updates.moduleEnabled === true) {
            next.suspendedAt = null;
            next.suspendedBy = null;
            next.suspensionReason = null;
        }
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleConsultantSettingsModel.findOneAndUpdate({ consultantId }, {
                $set: {
                    firmId: next.firmId,
                    moduleEnabled: next.moduleEnabled,
                    suspensionReason: next.suspensionReason,
                    suspendedAt: next.suspendedAt,
                    suspendedBy: next.suspendedBy,
                    chargingPolicy: next.chargingPolicy,
                    monthlyReportQuota: next.monthlyReportQuota,
                    lifetimeReportQuota: next.lifetimeReportQuota,
                    prepaidCreditsBalance: next.prepaidCreditsBalance,
                    updatedBy: next.updatedBy,
                },
            }, { upsert: true, new: true }).lean();
            return this.mapConsultantSettingsDoc(doc);
        }
        this.consultantSettings.set(consultantId, next);
        return { ...next };
    }
    // ==========================================================================
    // 8. Classroom QR Cohort Sessions
    // ==========================================================================
    async createQrSession(record) {
        const now = new Date();
        const full = {
            ...record,
            createdAt: now,
            updatedAt: now,
        };
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleQrSessionModel.create(full);
            return this.mapQrSessionDoc(doc);
        }
        if (this.qrSessions.has(full.qrSessionId)) {
            throw new Error(`Duplicate qrSessionId: ${full.qrSessionId}`);
        }
        for (const existing of this.qrSessions.values()) {
            if (existing.sessionTokenHash === full.sessionTokenHash) {
                throw new Error('Duplicate sessionTokenHash');
            }
        }
        this.qrSessions.set(full.qrSessionId, { ...full });
        return { ...full };
    }
    async findQrSessionById(qrSessionId, consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = { qrSessionId };
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const doc = await social_styles_schemas_1.SocialStyleQrSessionModel.findOne(filter).lean();
            return doc ? this.mapQrSessionDoc(doc) : null;
        }
        const item = this.qrSessions.get(qrSessionId);
        if (!item)
            return null;
        if (consultantIdScope && item.consultantId !== consultantIdScope) {
            return null;
        }
        return { ...item };
    }
    async findQrSessionByTokenHash(sessionTokenHash) {
        if (!sessionTokenHash)
            return null;
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleQrSessionModel.findOne({ sessionTokenHash }).lean();
            return doc ? this.mapQrSessionDoc(doc) : null;
        }
        for (const item of this.qrSessions.values()) {
            if (item.sessionTokenHash === sessionTokenHash) {
                return { ...item };
            }
        }
        return null;
    }
    async updateQrSession(qrSessionId, updates, consultantIdScope) {
        const now = new Date();
        if (this.isMongoConnected) {
            const filter = { qrSessionId };
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const doc = await social_styles_schemas_1.SocialStyleQrSessionModel.findOneAndUpdate(filter, { $set: { ...updates, updatedAt: now } }, { new: true }).lean();
            return doc ? this.mapQrSessionDoc(doc) : null;
        }
        const existing = this.qrSessions.get(qrSessionId);
        if (!existing)
            return null;
        if (consultantIdScope && existing.consultantId !== consultantIdScope) {
            return null;
        }
        const updated = {
            ...existing,
            ...updates,
            updatedAt: now,
        };
        this.qrSessions.set(qrSessionId, updated);
        return { ...updated };
    }
    async listQrSessions(consultantIdScope) {
        if (this.isMongoConnected) {
            const filter = {};
            if (consultantIdScope)
                filter.consultantId = consultantIdScope;
            const docs = await social_styles_schemas_1.SocialStyleQrSessionModel.find(filter)
                .sort({ createdAt: -1 })
                .lean();
            return docs.map((d) => this.mapQrSessionDoc(d));
        }
        let items = Array.from(this.qrSessions.values());
        if (consultantIdScope) {
            items = items.filter((s) => s.consultantId === consultantIdScope);
        }
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return items.map((s) => ({ ...s }));
    }
    async findAssessmentByQrSessionAndEmail(qrSessionId, participantEmail) {
        const normalizedEmail = participantEmail.trim().toLowerCase();
        if (this.isMongoConnected) {
            const doc = await social_styles_schemas_1.SocialStyleAssessmentModel.findOne({
                qrSessionId,
                participantEmail: normalizedEmail,
            })
                .sort({ createdAt: -1 })
                .lean();
            return doc ? this.mapAssessmentDoc(doc) : null;
        }
        const matches = Array.from(this.assessments.values())
            .filter((a) => a.qrSessionId === qrSessionId &&
            a.participantEmail.toLowerCase() === normalizedEmail)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return matches[0] ? { ...matches[0] } : null;
    }
    async claimQrSessionSeatAtomic(qrSessionId) {
        const now = new Date();
        if (this.isMongoConnected) {
            const sessionDoc = await social_styles_schemas_1.SocialStyleQrSessionModel.findOne({ qrSessionId }).lean();
            if (!sessionDoc || sessionDoc.status !== 'ACTIVE')
                return null;
            if (sessionDoc.expiresAt && new Date(sessionDoc.expiresAt).getTime() <= now.getTime()) {
                return null;
            }
            const filter = {
                qrSessionId,
                status: 'ACTIVE',
            };
            if (typeof sessionDoc.maxParticipants === 'number' && sessionDoc.maxParticipants > 0) {
                filter.registeredCount = { $lt: sessionDoc.maxParticipants };
            }
            const updatedDoc = await social_styles_schemas_1.SocialStyleQrSessionModel.findOneAndUpdate(filter, {
                $inc: { registeredCount: 1 },
                $set: { updatedAt: now },
            }, { new: true }).lean();
            return updatedDoc ? this.mapQrSessionDoc(updatedDoc) : null;
        }
        const existing = this.qrSessions.get(qrSessionId);
        if (!existing || existing.status !== 'ACTIVE')
            return null;
        if (existing.expiresAt && existing.expiresAt.getTime() <= now.getTime()) {
            return null;
        }
        if (typeof existing.maxParticipants === 'number' &&
            existing.maxParticipants > 0 &&
            existing.registeredCount >= existing.maxParticipants) {
            return null;
        }
        existing.registeredCount += 1;
        existing.updatedAt = now;
        this.qrSessions.set(qrSessionId, { ...existing });
        return { ...existing };
    }
    // ==========================================================================
    // Mappers
    // ==========================================================================
    mapAssessmentDoc(doc) {
        return {
            assessmentId: doc.assessmentId,
            consultantId: doc.consultantId,
            consultantName: doc.consultantName,
            consultantEmail: doc.consultantEmail,
            firmId: doc.firmId,
            firmName: doc.firmName,
            organizationId: doc.organizationId,
            organizationName: doc.organizationName,
            participantId: doc.participantId,
            participantName: doc.participantName,
            participantEmail: doc.participantEmail,
            participantPhone: doc.participantPhone,
            title: doc.title || 'Social Styles Assessment',
            reference: doc.reference,
            consultantNotes: doc.consultantNotes,
            language: doc.language || 'en',
            questionnaireVersion: doc.questionnaireVersion || 'v1.0',
            status: doc.status,
            sourceChannel: doc.sourceChannel || 'MANUAL',
            batchId: doc.batchId || null,
            qrSessionId: doc.qrSessionId || null,
            invitationEmailStatus: doc.invitationEmailStatus || 'NOT_SENT',
            invitationEmailSentAt: doc.invitationEmailSentAt ? new Date(doc.invitationEmailSentAt) : null,
            invitationEmailError: doc.invitationEmailError || null,
            publicTokenHash: doc.publicTokenHash,
            encryptedPublicToken: doc.encryptedPublicToken,
            tokenExpiresAt: doc.tokenExpiresAt ? new Date(doc.tokenExpiresAt) : null,
            tokenRevokedAt: doc.tokenRevokedAt ? new Date(doc.tokenRevokedAt) : null,
            invitedAt: doc.invitedAt ? new Date(doc.invitedAt) : null,
            startedAt: doc.startedAt ? new Date(doc.startedAt) : null,
            completedAt: doc.completedAt ? new Date(doc.completedAt) : null,
            reviewedAt: doc.reviewedAt ? new Date(doc.reviewedAt) : null,
            firstBillableExportId: doc.firstBillableExportId || null,
            firstBillableLockState: doc.firstBillableLockState || 'NONE',
            firstBillableLockedAt: doc.firstBillableLockedAt ? new Date(doc.firstBillableLockedAt) : null,
            firstExportedAt: doc.firstExportedAt ? new Date(doc.firstExportedAt) : null,
            lastReportExportedAt: doc.lastReportExportedAt ? new Date(doc.lastReportExportedAt) : null,
            reportExportCount: Number(doc.reportExportCount || 0),
            billableExportCount: Number(doc.billableExportCount || 0),
            createdBy: doc.createdBy,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        };
    }
    mapResponseDoc(doc) {
        return {
            responseId: doc.responseId,
            assessmentId: doc.assessmentId,
            consultantId: doc.consultantId,
            questionnaireVersion: doc.questionnaireVersion,
            selectedLanguage: doc.selectedLanguage || 'en',
            draftAnswers: doc.draftAnswers || [],
            answers: doc.answers || [],
            isSubmitted: Boolean(doc.isSubmitted),
            lastSavedAt: doc.lastSavedAt ? new Date(doc.lastSavedAt) : null,
            submittedAt: doc.submittedAt ? new Date(doc.submittedAt) : null,
            respondentUserAgent: doc.respondentUserAgent,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        };
    }
    mapResultDoc(doc) {
        return {
            resultId: doc.resultId,
            assessmentId: doc.assessmentId,
            consultantId: doc.consultantId,
            questionnaireVersion: doc.questionnaireVersion,
            scoringVersion: doc.scoringVersion,
            graphVersion: doc.graphVersion,
            answerBreakdown: doc.answerBreakdown || [],
            rawScores: doc.rawScores,
            finalScores: doc.finalScores,
            fourAxisProfile: doc.fourAxisProfile,
            netBalanceCoordinate: doc.netBalanceCoordinate,
            highestScoredStyles: doc.highestScoredStyles || [],
            calculatedAt: new Date(doc.calculatedAt),
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        };
    }
    mapReportDoc(doc) {
        return {
            reportId: doc.reportId,
            assessmentId: doc.assessmentId,
            consultantId: doc.consultantId,
            firmId: doc.firmId,
            reportVersion: doc.reportVersion,
            scoringVersion: doc.scoringVersion,
            interpretationVersion: doc.interpretationVersion,
            language: doc.language || 'en',
            fileName: doc.fileName,
            fileSizeBytes: Number(doc.fileSizeBytes),
            checksumSha256: doc.checksumSha256,
            storageReference: doc.storageReference,
            status: doc.status,
            usageEventId: doc.usageEventId,
            billable: Boolean(doc.billable),
            generatedBy: doc.generatedBy,
            generatedAt: new Date(doc.generatedAt),
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        };
    }
    mapUsageEventDoc(doc) {
        return {
            eventId: doc.eventId,
            idempotencyKey: doc.idempotencyKey,
            firstExportLockKey: doc.firstExportLockKey,
            consultantId: doc.consultantId,
            consultantName: doc.consultantName,
            consultantEmail: doc.consultantEmail,
            firmId: doc.firmId,
            firmName: doc.firmName,
            organizationId: doc.organizationId,
            organizationName: doc.organizationName,
            assessmentId: doc.assessmentId,
            participantName: doc.participantName,
            reportId: doc.reportId,
            eventType: doc.eventType,
            usageCategory: doc.usageCategory,
            chargingPolicyApplied: doc.chargingPolicyApplied,
            billable: Boolean(doc.billable),
            nonBillableReason: doc.nonBillableReason,
            exportFormat: doc.exportFormat || 'PDF',
            reportVersion: doc.reportVersion || 'v1.0',
            language: doc.language || 'en',
            billingPeriod: doc.billingPeriod,
            billingQuarter: doc.billingQuarter,
            billingYear: Number(doc.billingYear),
            triggeredByUserId: doc.triggeredByUserId,
            triggeredByRole: doc.triggeredByRole,
            metadata: doc.metadata || {},
            createdAt: new Date(doc.createdAt),
        };
    }
    mapConsultantSettingsDoc(doc) {
        return {
            consultantId: doc.consultantId,
            firmId: doc.firmId,
            moduleEnabled: doc.moduleEnabled !== false,
            suspensionReason: doc.suspensionReason || null,
            suspendedAt: doc.suspendedAt ? new Date(doc.suspendedAt) : null,
            suspendedBy: doc.suspendedBy || null,
            chargingPolicy: doc.chargingPolicy || 'FIRST_EXPORT_ONLY',
            monthlyReportQuota: typeof doc.monthlyReportQuota === 'number' ? doc.monthlyReportQuota : null,
            lifetimeReportQuota: typeof doc.lifetimeReportQuota === 'number' ? doc.lifetimeReportQuota : null,
            prepaidCreditsBalance: Number(doc.prepaidCreditsBalance || 0),
            updatedBy: doc.updatedBy,
            createdAt: new Date(doc.createdAt || Date.now()),
            updatedAt: new Date(doc.updatedAt || Date.now()),
        };
    }
    mapQrSessionDoc(doc) {
        return {
            qrSessionId: doc.qrSessionId,
            consultantId: doc.consultantId,
            consultantName: doc.consultantName,
            consultantEmail: doc.consultantEmail,
            firmId: doc.firmId,
            firmName: doc.firmName,
            organizationId: doc.organizationId,
            organizationName: doc.organizationName,
            title: doc.title || 'Social Styles Classroom Assessment',
            reference: doc.reference,
            consultantNotes: doc.consultantNotes,
            language: doc.language || 'en',
            assessmentLinkExpiryDays: Number(doc.assessmentLinkExpiryDays || 14),
            status: doc.status || 'ACTIVE',
            sessionTokenHash: doc.sessionTokenHash,
            encryptedSessionToken: doc.encryptedSessionToken,
            expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
            maxParticipants: typeof doc.maxParticipants === 'number' ? doc.maxParticipants : null,
            requirePhone: Boolean(doc.requirePhone),
            sendBackupEmail: doc.sendBackupEmail !== false,
            registeredCount: Number(doc.registeredCount || 0),
            createdBy: doc.createdBy,
            createdAt: new Date(doc.createdAt || Date.now()),
            updatedAt: new Date(doc.updatedAt || Date.now()),
        };
    }
}
exports.SocialStylesRepository = SocialStylesRepository;
//# sourceMappingURL=social-styles.repository.js.map