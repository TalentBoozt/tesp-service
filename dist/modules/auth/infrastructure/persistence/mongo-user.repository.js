"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const user_schema_1 = require("./user.schema");
class MongoUserRepository {
    mapDocumentToEntity(doc) {
        return new user_entity_1.UserEntity({
            userId: doc.userId,
            email: doc.email || undefined,
            passwordHash: doc.passwordHash,
            firstName: doc.firstName,
            lastName: doc.lastName,
            role: doc.role,
            firmId: doc.firmId,
            authorizedProjectIds: doc.authorizedProjectIds || [],
            primaryProjectId: doc.primaryProjectId,
            employeeId: doc.employeeId,
            phoneNumber: doc.phoneNumber,
            mustChangePassword: doc.mustChangePassword,
            failedLoginAttempts: doc.failedLoginAttempts,
            lockoutUntil: doc.lockoutUntil,
            passwordChangedAt: doc.passwordChangedAt,
            isActive: doc.isActive,
            isEmailVerified: doc.isEmailVerified,
            lastLoginAt: doc.lastLoginAt,
            passwordResetToken: doc.passwordResetToken,
            passwordResetExpires: doc.passwordResetExpires,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async findByEmail(email) {
        const normalized = (email || '').trim().toLowerCase();
        const doc = await user_schema_1.UserModel.findOne({ email: normalized }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findById(userId) {
        const doc = await user_schema_1.UserModel.findOne({ userId }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findByEmployeeId(employeeId, projectId) {
        const trimmed = (employeeId || '').trim();
        if (!trimmed)
            return null;
        const filter = { employeeId: trimmed };
        if (projectId) {
            filter.primaryProjectId = projectId;
        }
        const doc = await user_schema_1.UserModel.findOne(filter).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findByPhoneNumber(phoneNumber) {
        const trimmed = (phoneNumber || '').trim();
        if (!trimmed)
            return null;
        const doc = await user_schema_1.UserModel.findOne({ phoneNumber: trimmed }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findByResetToken(token) {
        const doc = await user_schema_1.UserModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async save(user) {
        await user_schema_1.UserModel.findOneAndUpdate({ userId: user.userId }, {
            userId: user.userId,
            email: user.email ? user.email.toLowerCase() : undefined,
            passwordHash: user.passwordHash,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            firmId: user.firmId,
            authorizedProjectIds: user.authorizedProjectIds,
            primaryProjectId: user.primaryProjectId,
            employeeId: user.employeeId,
            phoneNumber: user.phoneNumber,
            mustChangePassword: user.mustChangePassword,
            failedLoginAttempts: user.failedLoginAttempts,
            lockoutUntil: user.lockoutUntil,
            passwordChangedAt: user.passwordChangedAt,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: user.lastLoginAt,
            passwordResetToken: user.passwordResetToken,
            passwordResetExpires: user.passwordResetExpires,
        }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    }
    async count() {
        return user_schema_1.UserModel.countDocuments().exec();
    }
}
exports.MongoUserRepository = MongoUserRepository;
//# sourceMappingURL=mongo-user.repository.js.map