"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHasherService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptHasherService {
    saltRounds;
    constructor(saltRounds = 12) {
        this.saltRounds = saltRounds;
    }
    async hashPassword(password) {
        if (!password || password.trim().length === 0) {
            throw new Error('Password cannot be empty.');
        }
        return bcrypt_1.default.hash(password, this.saltRounds);
    }
    async verifyPassword(password, hash) {
        if (!password || !hash) {
            return false;
        }
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.BcryptHasherService = BcryptHasherService;
//# sourceMappingURL=bcrypt-hasher.service.js.map