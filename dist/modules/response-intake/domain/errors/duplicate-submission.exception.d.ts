export declare class DuplicateSubmissionException extends Error {
    readonly statusCode = 409;
    constructor(message?: string);
}
