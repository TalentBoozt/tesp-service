"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelGeneratorService = void 0;
class ExcelGeneratorService {
    async generateRawResponsesXlsx(responses) {
        const headers = ['ResponseId', 'CampaignId', 'RespondentType', 'NodeId', 'SubmittedAt', 'QuestionId', 'NumericValue', 'TextValue'];
        const rows = [headers.join(',')];
        for (const res of responses) {
            for (const ans of res.answers) {
                const textVal = ans.textValue ? `"${ans.textValue.replace(/"/g, '""')}"` : '';
                const row = [
                    res.responseId,
                    res.campaignId,
                    res.respondentType,
                    res.nodeId || 'GLOBAL',
                    res.submittedAt.toISOString(),
                    ans.questionId,
                    ans.numericValue !== undefined ? ans.numericValue : '',
                    textVal,
                ];
                rows.push(row.join(','));
            }
        }
        return Buffer.from(rows.join('\n'), 'utf-8');
    }
    async generateAggregatedScoresXlsx(nodeAggregates) {
        const headers = ['NodeId', 'ResponseCount', 'Status', 'eNPS', 'EngagementIndex'];
        const rows = [headers.join(',')];
        for (const node of nodeAggregates) {
            const isSuppressed = node.status === 'SUPPRESSED' || node.responseCount < 5;
            const enpsVal = isSuppressed ? '* N/A (N < 5)' : node.enps;
            const indexVal = isSuppressed ? '* N/A (N < 5)' : node.engagementIndex;
            rows.push([node.nodeId, node.responseCount, node.status, enpsVal, indexVal].join(','));
        }
        return Buffer.from(rows.join('\n'), 'utf-8');
    }
}
exports.ExcelGeneratorService = ExcelGeneratorService;
//# sourceMappingURL=excel-generator.service.js.map