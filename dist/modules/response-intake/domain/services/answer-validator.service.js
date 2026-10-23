"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerValidatorService = void 0;
class AnswerValidatorService {
    validateAnswers(answers, surveyQuestionsAst) {
        const questionMap = new Map();
        if (surveyQuestionsAst) {
            for (const q of surveyQuestionsAst) {
                questionMap.set(q.questionId, q);
            }
        }
        for (const ans of answers) {
            // 1. Numeric Score Bounds Checks (VR-INT-003)
            if (ans.questionType === 'LIKERT' && ans.numericValue !== undefined) {
                if (ans.numericValue < 1 || ans.numericValue > 5) {
                    throw new Error(`Numeric score out of range for LIKERT question '${ans.questionId}': value ${ans.numericValue} must be between 1 and 5`);
                }
            }
            if (ans.questionType === 'NPS' && ans.numericValue !== undefined) {
                if (ans.numericValue < 0 || ans.numericValue > 10) {
                    throw new Error(`Numeric score out of range for NPS question '${ans.questionId}': value ${ans.numericValue} must be between 0 and 10`);
                }
            }
            // 2. Validate AST Question Existence & Mandatory Checks (VR-INT-002, VR-INT-004)
            if (surveyQuestionsAst && surveyQuestionsAst.length > 0) {
                const qDef = questionMap.get(ans.questionId);
                if (!qDef) {
                    throw new Error(`Unknown question ID in submission: '${ans.questionId}'`);
                }
                if (qDef.isMandatory) {
                    const hasNumeric = ans.numericValue !== undefined && ans.numericValue !== null;
                    const hasText = ans.textValue !== undefined && ans.textValue !== null && ans.textValue.trim().length > 0;
                    const hasOptions = ans.selectedOptions && ans.selectedOptions.length > 0;
                    if (!hasNumeric && !hasText && !hasOptions) {
                        throw new Error(`Missing required mandatory question answer for question '${ans.questionId}'`);
                    }
                }
            }
        }
    }
}
exports.AnswerValidatorService = AnswerValidatorService;
//# sourceMappingURL=answer-validator.service.js.map