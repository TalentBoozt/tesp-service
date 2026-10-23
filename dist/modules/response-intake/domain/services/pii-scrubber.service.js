"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiiScrubberService = void 0;
const answer_value_object_1 = require("../entities/answer.value-object");
class PiiScrubberService {
    static EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    static PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
    sanitizeText(text) {
        if (!text)
            return text;
        let sanitized = text.replace(PiiScrubberService.EMAIL_REGEX, '[REDACTED_EMAIL]');
        sanitized = sanitized.replace(PiiScrubberService.PHONE_REGEX, (match) => {
            // Avoid replacing short numbers or numbers inside words unless clearly a phone format
            if (match.replace(/\D/g, '').length >= 7) {
                return '[REDACTED_PHONE]';
            }
            return match;
        });
        return sanitized;
    }
    sanitizeAnswers(answers) {
        return answers.map((ans) => {
            if ((ans.questionType === 'SHORT_TEXT' || ans.questionType === 'LONG_TEXT') && ans.textValue) {
                const cleanText = this.sanitizeText(ans.textValue);
                return new answer_value_object_1.AnswerValueObject({
                    ...ans,
                    textValue: cleanText,
                });
            }
            return new answer_value_object_1.AnswerValueObject(ans);
        });
    }
}
exports.PiiScrubberService = PiiScrubberService;
//# sourceMappingURL=pii-scrubber.service.js.map