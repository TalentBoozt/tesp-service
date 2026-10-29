"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgNodeMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const org_node_entity_1 = require("../../../domain/entities/org-node.entity");
const org_node_schema_1 = require("./org-node.schema");
const path_calculator_service_1 = require("../../../domain/services/path-calculator.service");
class OrgNodeMongoRepository {
    toEntity(doc) {
        return new org_node_entity_1.OrgNodeEntity({
            projectId: doc.projectId,
            nodeId: doc.nodeId,
            name: doc.name,
            type: doc.type,
            parentId: doc.parentId,
            path: doc.path,
            depth: doc.depth,
            displayOrder: doc.displayOrder,
            status: doc.status,
            attributes: doc.attributes,
            version: doc.version,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async save(node) {
        const raw = node.toJSON();
        const doc = await org_node_schema_1.OrgNodeModel.findOneAndUpdate({ projectId: node.projectId, nodeId: node.nodeId }, {
            $set: {
                name: raw.name,
                type: raw.type,
                parentId: raw.parentId,
                path: raw.path,
                depth: raw.depth,
                displayOrder: raw.displayOrder,
                status: raw.status,
                attributes: raw.attributes,
                version: raw.version,
                isDeleted: raw.isDeleted,
                updatedAt: raw.updatedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                nodeId: raw.nodeId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByNodeId(projectId, nodeId) {
        const doc = await org_node_schema_1.OrgNodeModel.findOne({ projectId, nodeId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findSubTree(projectId, basePath) {
        // Regex prefix search on indexed path field: ^,N-001,N-101,
        const escapedBasePath = basePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const docs = await org_node_schema_1.OrgNodeModel.find({
            projectId,
            isDeleted: false,
            path: { $regex: new RegExp(`^${escapedBasePath}`) },
        }).sort({ depth: 1, displayOrder: 1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async findAncestors(projectId, nodePath) {
        // Parse ancestor nodeIds from path string e.g. ",N-001,N-101,N-201," -> ["N-001", "N-101", "N-201"]
        const nodeIds = nodePath.split(',').filter(Boolean);
        if (nodeIds.length === 0)
            return [];
        const docs = await org_node_schema_1.OrgNodeModel.find({
            projectId,
            nodeId: { $in: nodeIds },
            isDeleted: false,
        });
        const entityMap = new Map();
        docs.forEach((doc) => entityMap.set(doc.nodeId, this.toEntity(doc)));
        // Return in order of path depth
        return nodeIds.map((id) => entityMap.get(id)).filter(Boolean);
    }
    async findAllByProject(projectId, options) {
        const query = { projectId, isDeleted: false };
        if (options?.parentId !== undefined) {
            query.parentId = options.parentId;
        }
        if (options?.type) {
            query.type = options.type.toUpperCase();
        }
        const docs = await org_node_schema_1.OrgNodeModel.find(query).sort({ depth: 1, displayOrder: 1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async existsByNodeId(projectId, nodeId) {
        const count = await org_node_schema_1.OrgNodeModel.countDocuments({ projectId, nodeId, isDeleted: false });
        return count > 0;
    }
    async hasActiveChildren(projectId, nodeId) {
        const count = await org_node_schema_1.OrgNodeModel.countDocuments({ projectId, parentId: nodeId, isDeleted: false });
        return count > 0;
    }
    async bulkUpdateSubTreePaths(projectId, oldPrefix, newPrefix) {
        // Fetch all descendant nodes starting with oldPrefix (excluding target node itself if oldPrefix matches exact path)
        const escapedOldPrefix = oldPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const descendants = await org_node_schema_1.OrgNodeModel.find({
            projectId,
            path: { $regex: new RegExp(`^${escapedOldPrefix}`) },
            isDeleted: false,
        });
        let modifiedCount = 0;
        for (const doc of descendants) {
            const updatedPath = path_calculator_service_1.PathCalculatorService.replacePathPrefix(doc.path, oldPrefix, newPrefix);
            const updatedDepth = updatedPath.split(',').filter(Boolean).length;
            await org_node_schema_1.OrgNodeModel.updateOne({ _id: doc._id }, {
                $set: {
                    path: updatedPath,
                    depth: updatedDepth,
                    updatedAt: new Date(),
                },
                $inc: { version: 1 },
            });
            modifiedCount++;
        }
        return modifiedCount;
    }
    async softDelete(projectId, nodeId) {
        const res = await org_node_schema_1.OrgNodeModel.updateOne({ projectId, nodeId, isDeleted: false }, { $set: { isDeleted: true, status: 'ARCHIVED', updatedAt: new Date() }, $inc: { version: 1 } });
        return res.modifiedCount > 0;
    }
    async moveNode(projectId, nodeId, newParentId, oldPath, newPath) {
        const session = mongoose_1.default.connection?.readyState === 1 && typeof mongoose_1.default.connection.startSession === 'function'
            ? await mongoose_1.default.startSession()
            : null;
        try {
            const executeUpdates = async (sess) => {
                const opts = sess ? { session: sess } : {};
                const depth = newPath.split(',').filter(Boolean).length;
                // 1. Update the moved target node
                const updatedDoc = await org_node_schema_1.OrgNodeModel.findOneAndUpdate({ projectId, nodeId, isDeleted: false }, {
                    $set: {
                        parentId: newParentId,
                        path: newPath,
                        depth,
                        updatedAt: new Date(),
                    },
                    $inc: { version: 1 },
                }, { new: true, ...opts });
                if (!updatedDoc) {
                    throw new Error(`Target node ${nodeId} not found in project ${projectId}`);
                }
                // 2. Atomically update all descendant child node paths
                const escapedOldPrefix = oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const descendants = await org_node_schema_1.OrgNodeModel.find({
                    projectId,
                    nodeId: { $ne: nodeId },
                    path: { $regex: new RegExp(`^${escapedOldPrefix}`) },
                    isDeleted: false,
                }, null, opts);
                for (const doc of descendants) {
                    const updatedChildPath = path_calculator_service_1.PathCalculatorService.replacePathPrefix(doc.path, oldPath, newPath);
                    const updatedChildDepth = updatedChildPath.split(',').filter(Boolean).length;
                    await org_node_schema_1.OrgNodeModel.updateOne({ _id: doc._id }, {
                        $set: {
                            path: updatedChildPath,
                            depth: updatedChildDepth,
                            updatedAt: new Date(),
                        },
                        $inc: { version: 1 },
                    }, opts);
                }
                return this.toEntity(updatedDoc);
            };
            if (session) {
                let result;
                await session.withTransaction(async () => {
                    result = await executeUpdates(session);
                });
                return result;
            }
            else {
                return await executeUpdates();
            }
        }
        finally {
            if (session) {
                await session.endSession();
            }
        }
    }
}
exports.OrgNodeMongoRepository = OrgNodeMongoRepository;
//# sourceMappingURL=org-node.repository.js.map