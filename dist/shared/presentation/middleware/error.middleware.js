"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    statusCode;
    message;
    type;
    details;
    constructor(statusCode, message, type = 'https://tesp-api.talnova.io/errors/general-error', details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.type = type;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    const statusCode = err.statusCode || (err.status ? err.status : 500);
    const type = err.type || 'https://tesp-api.talnova.io/errors/internal-server-error';
    const title = err.title || (statusCode === 400 ? 'Bad Request' : statusCode === 404 ? 'Not Found' : 'Internal Server Error');
    const detail = err.message || 'An unexpected error occurred';
    res.status(statusCode).json({
        type,
        title,
        status: statusCode,
        detail,
        instance: req.originalUrl,
        ...(err.details ? { errors: err.details } : {}),
    });
}
//# sourceMappingURL=error.middleware.js.map