"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class UserEntity {
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    static USER_ID_REGEX = /^USR-[A-Za-z0-9_-]{2,60}$/;
    userId;
    _email;
    _passwordHash;
    _firstName;
    _lastName;
    _role;
    _firmId;
    _authorizedProjectIds;
    _primaryProjectId;
    _employeeId;
    _phoneNumber;
    _mustChangePassword;
    _failedLoginAttempts;
    _lockoutUntil;
    _passwordChangedAt;
    _isActive;
    _isEmailVerified;
    _lastLoginAt;
    _passwordResetToken;
    _passwordResetExpires;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.userId || !UserEntity.USER_ID_REGEX.test(props.userId)) {
            throw new Error(`Invalid userId format '${props.userId}'. Expected format: ^USR-[A-Za-z0-9_-]{2,60}$ (e.g. USR-001).`);
        }
        const rawEmail = props.email ? props.email.trim().toLowerCase() : undefined;
        if (rawEmail) {
            if (!UserEntity.EMAIL_REGEX.test(rawEmail)) {
                throw new Error(`Invalid email address format: '${props.email}'.`);
            }
        }
        else {
            if (!props.employeeId?.trim() && !props.phoneNumber?.trim()) {
                throw new Error('At least one identifier (email, employeeId, or phoneNumber) is required.');
            }
        }
        if (!props.passwordHash || props.passwordHash.trim().length === 0) {
            throw new Error('passwordHash is required and cannot be empty.');
        }
        if (!props.firstName || props.firstName.trim().length === 0) {
            throw new Error('firstName is required.');
        }
        if (!props.primaryProjectId || props.primaryProjectId.trim().length === 0) {
            throw new Error('primaryProjectId is required.');
        }
        this.userId = props.userId;
        this._email = rawEmail;
        this._passwordHash = props.passwordHash;
        this._firstName = props.firstName.trim();
        this._lastName = (props.lastName || '').trim();
        this._role = (0, auth_middleware_1.normalizeUserRole)(props.role);
        this._firmId = props.firmId;
        this._authorizedProjectIds = Array.isArray(props.authorizedProjectIds) && props.authorizedProjectIds.length > 0
            ? [...new Set(props.authorizedProjectIds)]
            : [props.primaryProjectId];
        this._primaryProjectId = props.primaryProjectId;
        this._employeeId = props.employeeId?.trim() || undefined;
        this._phoneNumber = props.phoneNumber?.trim() || undefined;
        this._mustChangePassword = props.mustChangePassword !== undefined ? props.mustChangePassword : true;
        this._failedLoginAttempts = typeof props.failedLoginAttempts === 'number' ? props.failedLoginAttempts : 0;
        this._lockoutUntil = props.lockoutUntil;
        this._passwordChangedAt = props.passwordChangedAt;
        this._isActive = props.isActive !== undefined ? props.isActive : true;
        this._isEmailVerified = props.isEmailVerified !== undefined ? props.isEmailVerified : true;
        this._lastLoginAt = props.lastLoginAt;
        this._passwordResetToken = props.passwordResetToken;
        this._passwordResetExpires = props.passwordResetExpires;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    // Getters
    get email() { return this._email || ''; }
    get passwordHash() { return this._passwordHash; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get fullName() { return `${this._firstName} ${this._lastName}`.trim(); }
    get role() { return this._role; }
    get firmId() { return this._firmId; }
    get authorizedProjectIds() { return [...this._authorizedProjectIds]; }
    get primaryProjectId() { return this._primaryProjectId; }
    get employeeId() { return this._employeeId; }
    get phoneNumber() { return this._phoneNumber; }
    get mustChangePassword() { return this._mustChangePassword; }
    get failedLoginAttempts() { return this._failedLoginAttempts; }
    get lockoutUntil() { return this._lockoutUntil; }
    get passwordChangedAt() { return this._passwordChangedAt; }
    get isActive() { return this._isActive; }
    get isEmailVerified() { return this._isEmailVerified; }
    get lastLoginAt() { return this._lastLoginAt; }
    get passwordResetToken() { return this._passwordResetToken; }
    get passwordResetExpires() { return this._passwordResetExpires; }
    get updatedAt() { return this._updatedAt; }
    // Business Methods
    updatePassword(newPasswordHash) {
        if (!newPasswordHash || newPasswordHash.trim().length === 0) {
            throw new Error('New password hash cannot be empty.');
        }
        this._passwordHash = newPasswordHash;
        this._passwordResetToken = undefined;
        this._passwordResetExpires = undefined;
        this._updatedAt = new Date();
    }
    completePasswordChange(newPasswordHash) {
        if (!newPasswordHash || newPasswordHash.trim().length === 0) {
            throw new Error('New password hash cannot be empty.');
        }
        this._passwordHash = newPasswordHash;
        this._mustChangePassword = false;
        this._passwordChangedAt = new Date();
        this._failedLoginAttempts = 0;
        this._lockoutUntil = undefined;
        this._passwordResetToken = undefined;
        this._passwordResetExpires = undefined;
        this._updatedAt = new Date();
    }
    recordFailedLogin(lockoutThreshold = 5, lockoutDurationMinutes = 15) {
        this._failedLoginAttempts += 1;
        if (this._failedLoginAttempts >= lockoutThreshold) {
            this._lockoutUntil = new Date(Date.now() + lockoutDurationMinutes * 60000);
        }
        this._updatedAt = new Date();
    }
    recordSuccessfulLogin() {
        this._failedLoginAttempts = 0;
        this._lockoutUntil = undefined;
        this._lastLoginAt = new Date();
        this._updatedAt = new Date();
    }
    isLockedOut() {
        return !!(this._lockoutUntil && this._lockoutUntil.getTime() > Date.now());
    }
    updateProfile(firstName, lastName) {
        if (!firstName || firstName.trim().length === 0) {
            throw new Error('firstName cannot be empty.');
        }
        this._firstName = firstName.trim();
        this._lastName = (lastName || '').trim();
        this._updatedAt = new Date();
    }
    isAuthorizedForProject(projectId) {
        if (this._role === auth_middleware_1.UserRole.SUPER_ADMIN)
            return true;
        if (this._authorizedProjectIds.includes('*'))
            return true;
        return this._authorizedProjectIds.includes(projectId);
    }
    authorizeProject(projectId) {
        if (!this._authorizedProjectIds.includes(projectId)) {
            this._authorizedProjectIds.push(projectId);
            this._updatedAt = new Date();
        }
    }
    revokeProject(projectId) {
        this._authorizedProjectIds = this._authorizedProjectIds.filter(id => id !== projectId);
        if (this._primaryProjectId === projectId && this._authorizedProjectIds.length > 0) {
            this._primaryProjectId = this._authorizedProjectIds[0];
        }
        this._updatedAt = new Date();
    }
    setPrimaryProject(projectId) {
        if (!this.isAuthorizedForProject(projectId)) {
            throw new Error(`User is not authorized for project '${projectId}'.`);
        }
        this._primaryProjectId = projectId;
        this._updatedAt = new Date();
    }
    recordLogin() {
        this.recordSuccessfulLogin();
    }
    setPasswordResetToken(token, expires) {
        this._passwordResetToken = token;
        this._passwordResetExpires = expires;
        this._updatedAt = new Date();
    }
    clearPasswordResetToken() {
        this._passwordResetToken = undefined;
        this._passwordResetExpires = undefined;
        this._updatedAt = new Date();
    }
    deactivate() {
        this._isActive = false;
        this._updatedAt = new Date();
    }
    activate() {
        this._isActive = true;
        this._updatedAt = new Date();
    }
    toJSON() {
        return {
            userId: this.userId,
            email: this._email,
            firstName: this._firstName,
            lastName: this._lastName,
            fullName: this.fullName,
            role: this._role,
            firmId: this._firmId,
            authorizedProjectIds: this._authorizedProjectIds,
            primaryProjectId: this._primaryProjectId,
            employeeId: this._employeeId,
            phoneNumber: this._phoneNumber,
            mustChangePassword: this._mustChangePassword,
            failedLoginAttempts: this._failedLoginAttempts,
            lockoutUntil: this._lockoutUntil?.toISOString(),
            passwordChangedAt: this._passwordChangedAt?.toISOString(),
            isActive: this._isActive,
            isEmailVerified: this._isEmailVerified,
            lastLoginAt: this._lastLoginAt?.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
        };
    }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=user.entity.js.map