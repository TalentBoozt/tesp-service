"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEntity = void 0;
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class NotificationEntity {
    static NOTIFICATION_ID_REGEX = /^NTF-[A-Z0-9_-]{4,32}$/;
    notificationId;
    projectId;
    recipientUserId;
    recipientRole;
    category;
    severity;
    _title;
    _message;
    actionUrl;
    metadata;
    _isRead;
    _readAt;
    _emailDispatched;
    _emailDispatchedAt;
    createdAt;
    constructor(props) {
        if (!props.notificationId || !NotificationEntity.NOTIFICATION_ID_REGEX.test(props.notificationId)) {
            throw new Error(`Invalid notificationId '${props.notificationId}'. Must match pattern ^NTF-[A-Z0-9_-]{4,32}$`);
        }
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required for tenant notification isolation.');
        }
        if (!props.title || props.title.trim().length === 0) {
            throw new Error('Notification title cannot be empty.');
        }
        if (!props.message || props.message.trim().length === 0) {
            throw new Error('Notification message cannot be empty.');
        }
        const validCategories = ['CAMPAIGN', 'AI_ANOMALY', 'REPORT', 'HRIS', 'COMPLIANCE', 'ORGANIZATION'];
        if (!validCategories.includes(props.category)) {
            throw new Error(`Invalid notification category '${props.category}'. Supported: ${validCategories.join(', ')}`);
        }
        const validSeverities = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'];
        if (!validSeverities.includes(props.severity)) {
            throw new Error(`Invalid notification severity '${props.severity}'. Supported: ${validSeverities.join(', ')}`);
        }
        this.notificationId = props.notificationId;
        this.projectId = props.projectId.trim().toUpperCase();
        this.recipientUserId = props.recipientUserId;
        this.recipientRole = props.recipientRole;
        this.category = props.category;
        this.severity = props.severity;
        this._title = props.title.trim();
        this._message = props.message.trim();
        this.actionUrl = props.actionUrl;
        this.metadata = props.metadata ? { ...props.metadata } : undefined;
        this._isRead = props.isRead ?? false;
        this._readAt = props.readAt ?? (this._isRead ? new Date() : null);
        this._emailDispatched = props.emailDispatched ?? false;
        this._emailDispatchedAt = props.emailDispatchedAt ?? null;
        this.createdAt = props.createdAt || new Date();
    }
    // Getters
    get title() {
        return this._title;
    }
    get message() {
        return this._message;
    }
    get isRead() {
        return this._isRead;
    }
    get readAt() {
        return this._readAt;
    }
    get emailDispatched() {
        return this._emailDispatched;
    }
    get emailDispatchedAt() {
        return this._emailDispatchedAt;
    }
    // Domain Behaviors
    markAsRead() {
        if (!this._isRead) {
            this._isRead = true;
            this._readAt = new Date();
        }
    }
    markAsUnread() {
        if (this._isRead) {
            this._isRead = false;
            this._readAt = null;
        }
    }
    setEmailDispatched() {
        this._emailDispatched = true;
        this._emailDispatchedAt = new Date();
    }
    matchesRecipient(userId, role) {
        // If targeted to a specific user
        if (this.recipientUserId) {
            return this.recipientUserId === userId;
        }
        // If targeted to a specific role broadcast
        if (this.recipientRole) {
            if (role === auth_middleware_1.UserRole.SUPER_ADMIN)
                return true;
            const isTargetConsultant = this.recipientRole === auth_middleware_1.UserRole.CONSULTANT || this.recipientRole === auth_middleware_1.UserRole.CONSULTANT_DAASH;
            const isUserConsultant = role === auth_middleware_1.UserRole.CONSULTANT || role === auth_middleware_1.UserRole.CONSULTANT_DAASH;
            if (isTargetConsultant && isUserConsultant)
                return true;
            return this.recipientRole === role;
        }
        // Broadcast to entire tenant
        return true;
    }
    toJSON() {
        return {
            notificationId: this.notificationId,
            projectId: this.projectId,
            recipientUserId: this.recipientUserId,
            recipientRole: this.recipientRole,
            category: this.category,
            severity: this.severity,
            title: this._title,
            message: this._message,
            actionUrl: this.actionUrl,
            metadata: this.metadata,
            isRead: this._isRead,
            readAt: this._readAt,
            emailDispatched: this._emailDispatched,
            emailDispatchedAt: this._emailDispatchedAt,
            createdAt: this.createdAt,
        };
    }
}
exports.NotificationEntity = NotificationEntity;
//# sourceMappingURL=notification.entity.js.map