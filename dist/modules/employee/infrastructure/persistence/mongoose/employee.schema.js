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
exports.EmployeeModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EmployeeSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    employeeId: {
        type: String,
        required: true,
        match: /^[A-Za-z0-9_-]{2,30}$/,
    },
    nodeId: { type: String, required: true, index: true },
    matrixNodeIds: [{ type: String, index: true }],
    email: {
        type: String,
        required: false,
        validate: {
            validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Invalid email address format',
        },
    },
    fullName: { type: String, required: true },
    phoneNumber: { type: String },
    status: {
        type: String,
        enum: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'],
        default: 'ACTIVE',
    },
    attributes: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    collection: 'employees',
    timestamps: true,
});
// Compound Unique Index: Unique employeeId per project workspace
EmployeeSchema.index({ projectId: 1, employeeId: 1 }, { unique: true });
// Compound Search Index: Search by project, nodeId, and status
EmployeeSchema.index({ projectId: 1, nodeId: 1, status: 1, isDeleted: 1 });
// Multikey Index for Matrix Node assignments
EmployeeSchema.index({ projectId: 1, matrixNodeIds: 1 });
exports.EmployeeModel = mongoose_1.default.model('Employee', EmployeeSchema);
//# sourceMappingURL=employee.schema.js.map