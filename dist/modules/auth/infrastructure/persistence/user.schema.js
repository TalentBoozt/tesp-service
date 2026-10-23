"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
    },
    role: {
        type: String,
        required: true,
        index: true,
    },
    firmId: {
        type: String,
        index: true,
    },
    authorizedProjectIds: [{
            type: String,
            index: true,
        }],
    primaryProjectId: {
        type: String,
        required: true,
        default: 'PRJ-99201',
        index: true,
    },
    employeeId: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    mustChangePassword: {
        type: Boolean,
        default: true,
        index: true,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockoutUntil: {
        type: Date,
        index: true,
    },
    passwordChangedAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
}, {
    collection: 'users',
    timestamps: true,
});
// High-Scale Compound & Sparse Indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
UserSchema.index({ primaryProjectId: 1, employeeId: 1 }, { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } });
UserSchema.index({ phoneNumber: 1 }, { unique: true, partialFilterExpression: { phoneNumber: { $type: 'string' } } });
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=user.schema.js.map