"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiiSanitizerService = void 0;
class PiiSanitizerService {
    emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,12}/g;
    nameRegex = /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Contact|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
    sanitize(text) {
        if (!text || text.trim().length === 0) {
            return { sanitizedText: '', emailCount: 0, phoneCount: 0, nameCount: 0 };
        }
        let emailCount = 0;
        let phoneCount = 0;
        let nameCount = 0;
        let sanitized = text.replace(this.emailRegex, () => {
            emailCount++;
            return '[MASKED_EMAIL]';
        });
        sanitized = sanitized.replace(this.phoneRegex, () => {
            phoneCount++;
            return '[MASKED_PHONE]';
        });
        sanitized = sanitized.replace(this.nameRegex, (match, nameGroup) => {
            nameCount++;
            return match.replace(nameGroup, '[MASKED_NAME]');
        });
        return {
            sanitizedText: sanitized,
            emailCount,
            phoneCount,
            nameCount,
        };
    }
    assertZeroPii(text) {
        if (this.emailRegex.test(text) || this.phoneRegex.test(text)) {
            throw new Error(`Security Violation: Unmasked PII detected in outgoing text payload!`);
        }
    }
}
exports.PiiSanitizerService = PiiSanitizerService;
//# sourceMappingURL=pii-sanitizer.service.js.map