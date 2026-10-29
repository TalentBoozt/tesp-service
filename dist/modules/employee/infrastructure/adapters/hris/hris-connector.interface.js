"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrisSyncException = void 0;
class HrisSyncException extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.name = 'HrisSyncException';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HrisSyncException = HrisSyncException;
//# sourceMappingURL=hris-connector.interface.js.map