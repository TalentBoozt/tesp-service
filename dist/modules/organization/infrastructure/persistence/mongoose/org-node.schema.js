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
exports.OrgNodeModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrgNodeSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    nodeId: {
        type: String,
        required: true,
        match: /^N-[A-Za-z0-9_-]{3,20}$/,
    },
    name: { type: String, required: true },
    type: { type: String, required: true, uppercase: true },
    parentId: { type: String, default: null, index: true },
    path: {
        type: String,
        required: true,
        match: /^,([A-Za-z0-9_-]+,)+$/,
    },
    depth: { type: Number, required: true },
    displayOrder: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
        default: 'ACTIVE',
    },
    attributes: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    collection: 'organization_nodes',
    timestamps: true,
});
// Compound Unique Index: Unique nodeId per project workspace
OrgNodeSchema.index({ projectId: 1, nodeId: 1 }, { unique: true });
// Compound Materialized Path Prefix Index for Lightning Sub-Tree Regex Queries (< 10ms SLA)
OrgNodeSchema.index({ projectId: 1, path: 1, isDeleted: 1 });
// Compound Parent Index
OrgNodeSchema.index({ projectId: 1, parentId: 1, isDeleted: 1 });
exports.OrgNodeModel = mongoose_1.default.model('OrgNode', OrgNodeSchema);
//# sourceMappingURL=org-node.schema.js.map