"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateSubmissionException = void 0;
class DuplicateSubmissionException extends Error {
    statusCode = 409;
    constructor(message = 'Token has already been consumed or is invalid') {
        super(message);
        this.name = 'DuplicateSubmissionException';
        Object.setPrototypeOf(this, DuplicateSubmissionException.prototype);
    }
}
exports.DuplicateSubmissionException = DuplicateSubmissionException;
//# sourceMappingURL=duplicate-submission.exception.js.map