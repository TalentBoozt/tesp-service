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
exports.NotificationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const auth_middleware_1 = require("../../../../../shared/presentation/middleware/auth.middleware");
const NotificationSchema = new mongoose_1.Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true,
        match: /^NTF-[A-Z0-9_-]{4,32}$/,
        index: true,
    },
    projectId: {
        type: String,
        required: true,
        index: true,
    },
    recipientUserId: {
        type: String,
        index: true,
    },
    recipientRole: {
        type: String,
        enum: Object.values(auth_middleware_1.UserRole),
        index: true,
    },
    category: {
        type: String,
        enum: ['CAMPAIGN', 'AI_ANOMALY', 'REPORT', 'HRIS', 'COMPLIANCE', 'ORGANIZATION'],
        required: true,
        index: true,
    },
    severity: {
        type: String,
        enum: ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'],
        default: 'INFO',
        index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    emailDispatched: { type: Boolean, default: false },
    emailDispatchedAt: { type: Date },
}, {
    collection: 'tenant_notifications',
    timestamps: true,
});
// High-speed compound indexes for tenant & role lookups
NotificationSchema.index({ projectId: 1, recipientRole: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ projectId: 1, recipientUserId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ projectId: 1, category: 1, createdAt: -1 });
// TTL expiration: Automatically remove read notifications 90 days after readAt
NotificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 7776000, partialFilterExpression: { isRead: true } });
exports.NotificationModel = mongoose_1.default.model('TenantNotification', NotificationSchema);
//# sourceMappingURL=notification.schema.js.map