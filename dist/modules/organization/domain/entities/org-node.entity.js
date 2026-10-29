"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgNodeEntity = void 0;
class OrgNodeEntity {
    static NODE_ID_REGEX = /^N-[A-Za-z0-9_-]{3,20}$/;
    static PATH_REGEX = /^,([A-Za-z0-9_-]+,)+$/;
    projectId;
    nodeId;
    _name;
    _type;
    _parentId;
    _path;
    _depth;
    _displayOrder;
    _status;
    _headCount;
    _directHeadCount;
    _attributes;
    _version;
    _isDeleted;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required');
        }
        if (!props.nodeId || !OrgNodeEntity.NODE_ID_REGEX.test(props.nodeId)) {
            throw new Error(`Invalid Node ID format '${props.nodeId}'. Must match regex pattern ^N-[A-Za-z0-9_-]{3,20}$ (e.g. N-201).`);
        }
        if (!props.name || props.name.trim().length === 0) {
            throw new Error('Node name is required');
        }
        if (!props.type || props.type.trim().length === 0) {
            throw new Error('Node type is required');
        }
        this.projectId = props.projectId;
        this.nodeId = props.nodeId;
        this._name = props.name.trim();
        this._type = props.type.trim().toUpperCase();
        this._parentId = props.parentId || null;
        this._path = props.path || `,${props.nodeId},`;
        this._depth = props.depth ?? (this._path.split(',').filter(Boolean).length);
        this._displayOrder = props.displayOrder ?? 0;
        this._status = props.status || 'ACTIVE';
        this._headCount = props.headCount;
        this._directHeadCount = props.directHeadCount;
        this._attributes = props.attributes || {};
        this._version = props.version || 1;
        this._isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }
    // Getters
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get parentId() {
        return this._parentId;
    }
    get path() {
        return this._path;
    }
    get depth() {
        return this._depth;
    }
    get displayOrder() {
        return this._displayOrder;
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
    // Business Behavior & Invariants
    updateDetails(params) {
        if (this._isDeleted) {
            throw new Error('Cannot update a soft-deleted organization node.');
        }
        if (params.name !== undefined) {
            if (!params.name || params.name.trim().length === 0) {
                throw new Error('Node name cannot be empty');
            }
            this._name = params.name.trim();
        }
        if (params.type !== undefined) {
            if (!params.type || params.type.trim().length === 0) {
                throw new Error('Node type cannot be empty');
            }
            this._type = params.type.trim().toUpperCase();
        }
        if (params.displayOrder !== undefined) {
            this._displayOrder = params.displayOrder;
        }
        if (params.attributes) {
            this._attributes = { ...this._attributes, ...params.attributes };
        }
        this._version += 1;
        this._updatedAt = new Date();
    }
    setPathAndParent(newParentId, parentPath) {
        if (this._isDeleted) {
            throw new Error('Cannot move a soft-deleted organization node.');
        }
        this._parentId = newParentId;
        if (!newParentId || !parentPath) {
            this._path = `,${this.nodeId},`;
            this._depth = 1;
        }
        else {
            const cleanParentPath = parentPath.endsWith(',') ? parentPath : `${parentPath},`;
            this._path = `${cleanParentPath}${this.nodeId},`;
            this._depth = this._path.split(',').filter(Boolean).length;
        }
        this._version += 1;
        this._updatedAt = new Date();
    }
    setStatus(newStatus) {
        this._status = newStatus;
        this._version += 1;
        this._updatedAt = new Date();
    }
    markAsDeleted() {
        this._isDeleted = true;
        this._status = 'ARCHIVED';
        this._version += 1;
        this._updatedAt = new Date();
    }
    get headCount() {
        return this._headCount ?? (this._attributes?.Headcount ? Number(this._attributes.Headcount) : 0);
    }
    get directHeadCount() {
        return this._directHeadCount ?? this.headCount;
    }
    setHeadCount(totalCount, directCount) {
        this._headCount = totalCount;
        this._directHeadCount = directCount !== undefined ? directCount : totalCount;
        this._attributes = {
            ...this._attributes,
            Headcount: totalCount,
        };
    }
    toJSON() {
        const totalHeadCount = this._headCount ?? (this._attributes?.Headcount ? Number(this._attributes.Headcount) : 0);
        const directHeadCount = this._directHeadCount ?? totalHeadCount;
        return {
            projectId: this.projectId,
            nodeId: this.nodeId,
            name: this._name,
            type: this._type,
            parentId: this._parentId,
            path: this._path,
            depth: this._depth,
            displayOrder: this._displayOrder,
            status: this._status,
            headCount: totalHeadCount,
            directHeadCount: directHeadCount,
            attributes: {
                ...this._attributes,
                Headcount: totalHeadCount,
            },
            version: this._version,
            isDeleted: this._isDeleted,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.OrgNodeEntity = OrgNodeEntity;
//# sourceMappingURL=org-node.entity.js.map