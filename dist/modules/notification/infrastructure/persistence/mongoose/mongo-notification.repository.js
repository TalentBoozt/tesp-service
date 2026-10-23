"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoNotificationRepository = void 0;
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const notification_schema_1 = require("./notification.schema");
const auth_middleware_1 = require("../../../../../shared/presentation/middleware/auth.middleware");
class MongoNotificationRepository {
    toEntity(doc) {
        return new notification_entity_1.NotificationEntity({
            notificationId: doc.notificationId,
            projectId: doc.projectId,
            recipientUserId: doc.recipientUserId,
            recipientRole: doc.recipientRole,
            category: doc.category,
            severity: doc.severity,
            title: doc.title,
            message: doc.message,
            actionUrl: doc.actionUrl,
            metadata: doc.metadata,
            isRead: doc.isRead,
            readAt: doc.readAt,
            emailDispatched: doc.emailDispatched,
            emailDispatchedAt: doc.emailDispatchedAt,
            createdAt: doc.createdAt,
        });
    }
    async save(notification) {
        const raw = notification.toJSON();
        const doc = await notification_schema_1.NotificationModel.findOneAndUpdate({ notificationId: notification.notificationId }, {
            $set: {
                projectId: raw.projectId,
                recipientUserId: raw.recipientUserId,
                recipientRole: raw.recipientRole,
                category: raw.category,
                severity: raw.severity,
                title: raw.title,
                message: raw.message,
                actionUrl: raw.actionUrl,
                metadata: raw.metadata,
                isRead: raw.isRead,
                readAt: raw.readAt,
                emailDispatched: raw.emailDispatched,
                emailDispatchedAt: raw.emailDispatchedAt,
            },
            $setOnInsert: {
                notificationId: raw.notificationId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async saveBatch(notifications) {
        if (notifications.length === 0)
            return;
        const ops = notifications.map((n) => {
            const raw = n.toJSON();
            return {
                updateOne: {
                    filter: { notificationId: n.notificationId },
                    update: {
                        $set: {
                            projectId: raw.projectId,
                            recipientUserId: raw.recipientUserId,
                            recipientRole: raw.recipientRole,
                            category: raw.category,
                            severity: raw.severity,
                            title: raw.title,
                            message: raw.message,
                            actionUrl: raw.actionUrl,
                            metadata: raw.metadata,
                            isRead: raw.isRead,
                            readAt: raw.readAt,
                            emailDispatched: raw.emailDispatched,
                            emailDispatchedAt: raw.emailDispatchedAt,
                        },
                        $setOnInsert: {
                            notificationId: raw.notificationId,
                            createdAt: raw.createdAt,
                        },
                    },
                    upsert: true,
                },
            };
        });
        await notification_schema_1.NotificationModel.bulkWrite(ops);
    }
    async findByNotificationId(notificationId) {
        const doc = await notification_schema_1.NotificationModel.findOne({ notificationId });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    buildRecipientFilter(recipientUserId, recipientRole) {
        const conditions = [];
        // General tenant broadcast notifications (neither recipientUserId nor recipientRole specified)
        conditions.push({ recipientUserId: { $exists: false }, recipientRole: { $exists: false } });
        conditions.push({ recipientUserId: null, recipientRole: null });
        if (recipientUserId) {
            conditions.push({ recipientUserId });
        }
        if (recipientRole) {
            if (recipientRole === auth_middleware_1.UserRole.SUPER_ADMIN) {
                // SUPER_ADMIN has access to all notifications in the project
                return {};
            }
            conditions.push({ recipientRole });
        }
        return { $or: conditions };
    }
    async findTenantNotifications(query) {
        const filter = {
            projectId: query.projectId.trim().toUpperCase(),
        };
        if (query.isRead !== undefined) {
            filter.isRead = query.isRead;
        }
        if (query.category) {
            filter.category = query.category;
        }
        if (query.severity) {
            filter.severity = query.severity;
        }
        const recipientFilter = this.buildRecipientFilter(query.recipientUserId, query.recipientRole);
        if (Object.keys(recipientFilter).length > 0) {
            filter.$and = [recipientFilter];
        }
        const limit = query.limit || 30;
        const offset = query.offset || 0;
        const [docs, total] = await Promise.all([
            notification_schema_1.NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit),
            notification_schema_1.NotificationModel.countDocuments(filter),
        ]);
        return {
            notifications: docs.map((d) => this.toEntity(d)),
            total,
        };
    }
    async countUnread(projectId, recipientUserId, recipientRole) {
        const filter = {
            projectId: projectId.trim().toUpperCase(),
            isRead: false,
        };
        const recipientFilter = this.buildRecipientFilter(recipientUserId, recipientRole);
        if (Object.keys(recipientFilter).length > 0) {
            filter.$and = [recipientFilter];
        }
        return notification_schema_1.NotificationModel.countDocuments(filter);
    }
    async markAsRead(notificationId, projectId) {
        const res = await notification_schema_1.NotificationModel.updateOne({ notificationId, projectId: projectId.trim().toUpperCase() }, { $set: { isRead: true, readAt: new Date() } });
        return res.modifiedCount > 0;
    }
    async markAllAsRead(projectId, recipientUserId, recipientRole) {
        const filter = {
            projectId: projectId.trim().toUpperCase(),
            isRead: false,
        };
        const recipientFilter = this.buildRecipientFilter(recipientUserId, recipientRole);
        if (Object.keys(recipientFilter).length > 0) {
            filter.$and = [recipientFilter];
        }
        const res = await notification_schema_1.NotificationModel.updateMany(filter, {
            $set: { isRead: true, readAt: new Date() },
        });
        return res.modifiedCount;
    }
    async delete(notificationId, projectId) {
        const res = await notification_schema_1.NotificationModel.deleteOne({
            notificationId,
            projectId: projectId.trim().toUpperCase(),
        });
        return res.deletedCount > 0;
    }
}
exports.MongoNotificationRepository = MongoNotificationRepository;
//# sourceMappingURL=mongo-notification.repository.js.map