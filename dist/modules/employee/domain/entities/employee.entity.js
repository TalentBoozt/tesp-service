"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeEntity = void 0;
class EmployeeEntity {
    static EMPLOYEE_ID_REGEX = /^[A-Za-z0-9_-]{2,30}$/;
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    projectId;
    employeeId;
    _nodeId;
    _matrixNodeIds;
    _email;
    _fullName;
    _phoneNumber;
    _status;
    _attributes;
    _version;
    _isDeleted;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required');
        }
        const rawEmpId = props.employeeId?.trim();
        if (rawEmpId && !EmployeeEntity.EMPLOYEE_ID_REGEX.test(rawEmpId)) {
            throw new Error(`Invalid Employee ID format '${props.employeeId}'. Expected format: ^[A-Za-z0-9_-]{2,30}$ (e.g. EMP-101).`);
        }
        if (!props.nodeId || props.nodeId.trim().length === 0) {
            throw new Error('Primary Organization nodeId is required');
        }
        const rawEmail = props.email?.trim()?.toLowerCase();
        if (rawEmail && !EmployeeEntity.EMAIL_REGEX.test(rawEmail)) {
            throw new Error(`Invalid email address format '${props.email}'. Must be a valid email address.`);
        }
        const rawPhone = props.phoneNumber?.trim();
        // Mandatory rule: At least one of email, employeeId, or phoneNumber must be provided
        if (!rawEmail && !rawEmpId && !rawPhone) {
            throw new Error('At least one identifier (email, employeeId, or phoneNumber) is required.');
        }
        if (!props.fullName || props.fullName.trim().length === 0) {
            throw new Error('fullName is required');
        }
        this.projectId = props.projectId;
        this.employeeId = rawEmpId || `EMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        this._nodeId = props.nodeId.trim();
        this._matrixNodeIds = props.matrixNodeIds || [];
        this._email = rawEmail || '';
        this._fullName = props.fullName.trim();
        this._phoneNumber = rawPhone;
        this._status = props.status || 'ACTIVE';
        this._attributes = props.attributes || {};
        this._version = props.version || 1;
        this._isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    // Getters
    get nodeId() {
        return this._nodeId;
    }
    get matrixNodeIds() {
        return [...this._matrixNodeIds];
    }
    get email() {
        return this._email;
    }
    get fullName() {
        return this._fullName;
    }
    get phoneNumber() {
        return this._phoneNumber;
    }
    get status() {
        return this._status;
    }
    get attributes() {
        return { ...this._attributes };
    }
    get version() {
        return this._version;
    }
    get isDeleted() {
        return this._isDeleted;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    // Business Logic & Transitions
    updateDetails(params) {
        if (this._isDeleted) {
            throw new Error('Cannot update a deleted employee record.');
        }
        if (params.nodeId !== undefined) {
            if (!params.nodeId || params.nodeId.trim().length === 0) {
                throw new Error('Primary nodeId cannot be empty');
            }
            this._nodeId = params.nodeId.trim();
        }
        if (params.matrixNodeIds !== undefined) {
            this._matrixNodeIds = [...params.matrixNodeIds];
        }
        if (params.email !== undefined) {
            const trimmed = params.email.trim().toLowerCase();
            if (trimmed && !EmployeeEntity.EMAIL_REGEX.test(trimmed)) {
                throw new Error(`Invalid email address format '${params.email}'.`);
            }
            this._email = trimmed;
        }
        if (params.fullName !== undefined) {
            if (!params.fullName || params.fullName.trim().length === 0) {
                throw new Error('fullName cannot be empty');
            }
            this._fullName = params.fullName.trim();
        }
        if (params.phoneNumber !== undefined) {
            this._phoneNumber = params.phoneNumber.trim();
        }
        if (params.status !== undefined) {
            this._status = params.status;
        }
        if (params.attributes) {
            this._attributes = { ...this._attributes, ...params.attributes };
        }
        this._version += 1;
        this._updatedAt = new Date();
    }
    terminate() {
        this._status = 'TERMINATED';
        this._version += 1;
        this._updatedAt = new Date();
    }
    markAsDeleted() {
        this._isDeleted = true;
        this._status = 'TERMINATED';
        this._version += 1;
        this._updatedAt = new Date();
    }
    toDemographicSnapshot(ancestorPaths) {
        return {
            employeeId: this.employeeId,
            projectId: this.projectId,
            nodeId: this._nodeId,
            matrixNodeIds: [...this._matrixNodeIds],
            attributes: { ...this._attributes },
            ...(ancestorPaths ? { ancestorPaths } : {}),
            compiledAt: new Date().toISOString(),
        };
    }
    toJSON() {
        return {
            projectId: this.projectId,
            employeeId: this.employeeId,
            nodeId: this._nodeId,
            matrixNodeIds: this._matrixNodeIds,
            email: this._email,
            fullName: this._fullName,
            phoneNumber: this._phoneNumber,
            status: this._status,
            attributes: this._attributes,
            version: this._version,
            isDeleted: this._isDeleted,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.EmployeeEntity = EmployeeEntity;
//# sourceMappingURL=employee.entity.js.map