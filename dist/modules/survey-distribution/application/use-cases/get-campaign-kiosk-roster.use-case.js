"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCampaignKioskRosterUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const token_vault_schema_1 = require("../../infrastructure/persistence/mongoose/token-vault.schema");
const campaign_schema_1 = require("../../infrastructure/persistence/mongoose/campaign.schema");
const employee_schema_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.schema");
class GetCampaignKioskRosterUseCase {
    campaignRepo;
    vaultRepo;
    employeeRepo;
    constructor(campaignRepo, vaultRepo, employeeRepo) {
        this.campaignRepo = campaignRepo;
        this.vaultRepo = vaultRepo;
        this.employeeRepo = employeeRepo;
    }
    async execute(projectId, campaignId, nodeId) {
        // 1. Resolve campaign
        let campaign = null;
        if (this.campaignRepo) {
            campaign = await this.campaignRepo.findByCampaignId(projectId, campaignId);
        }
        if (!campaign && mongoose_1.default.connection?.readyState === 1) {
            campaign = await campaign_schema_1.CampaignModel.findOne({ projectId, campaignId });
        }
        if (!campaign) {
            throw new Error(`Campaign '${campaignId}' not found in project '${projectId}'`);
        }
        // 2. Query tokens for ground workers (channel: 'PIN_KIOSK' or 6-digit PIN)
        let vaultDocs = [];
        if (this.vaultRepo && typeof this.vaultRepo.findTokensByCampaign === 'function') {
            vaultDocs = await this.vaultRepo.findTokensByCampaign(projectId, campaignId);
        }
        else if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const vaultQuery = {
                    projectId,
                    campaignId,
                    $or: [
                        { channel: 'PIN_KIOSK' },
                        { token: { $regex: /^\d{6}$/ } },
                    ],
                };
                if (nodeId) {
                    vaultQuery.nodeId = nodeId;
                }
                vaultDocs = await token_vault_schema_1.TokenVaultModel.find(vaultQuery).sort({ createdAt: -1 });
            }
            catch {
                vaultDocs = [];
            }
        }
        // Filter ground workers and node
        vaultDocs = vaultDocs.filter((doc) => {
            const isGroundChannel = doc.channel === 'PIN_KIOSK' || /^\d{6}$/.test(doc.token);
            const matchesNode = !nodeId || doc.nodeId === nodeId;
            return isGroundChannel && matchesNode;
        });
        // 3. Resolve employee metadata (fullName, nodeId, etc.)
        const employeeIds = vaultDocs
            .map((v) => v.employeeId)
            .filter((id) => Boolean(id && id !== 'ANONYMOUS'));
        const empMap = new Map();
        if (this.employeeRepo && employeeIds.length > 0) {
            for (const empId of employeeIds) {
                if (typeof this.employeeRepo.findByEmployeeId === 'function') {
                    const emp = await this.employeeRepo.findByEmployeeId(projectId, empId);
                    if (emp) {
                        empMap.set(emp.employeeId, {
                            fullName: emp.fullName,
                            nodeId: emp.nodeId,
                            phone: emp.phoneNumber,
                        });
                    }
                }
            }
        }
        if (empMap.size === 0 && employeeIds.length > 0 && mongoose_1.default.connection?.readyState === 1) {
            try {
                const empDocs = await employee_schema_1.EmployeeModel.find({
                    projectId,
                    employeeId: { $in: employeeIds },
                });
                for (const emp of empDocs) {
                    empMap.set(emp.employeeId, {
                        fullName: emp.fullName,
                        nodeId: emp.nodeId,
                        phone: emp.phoneNumber,
                    });
                }
            }
            catch {
                // Ignore fallback error
            }
        }
        // 4. Build roster items
        const roster = vaultDocs.map((doc) => {
            const empId = doc.employeeId || 'ANONYMOUS';
            const empInfo = empMap.get(empId);
            const fullName = empInfo?.fullName || (empId !== 'ANONYMOUS' ? `Employee ${empId}` : 'Anonymous Participant');
            const resolvedNodeId = doc.nodeId || empInfo?.nodeId || 'GENERAL';
            const pin = doc.token.replace(/^PIN-/, '');
            return {
                employeeId: empId,
                fullName,
                nodeId: resolvedNodeId,
                pin,
                kioskUrl: `/intake?mode=kiosk&campaignId=${campaignId}`,
                channel: doc.channel || 'PIN_KIOSK',
                isBurned: doc.isBurned,
                burnedAt: doc.burnedAt ? doc.burnedAt.toISOString() : undefined,
                expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : undefined,
            };
        });
        // 5. Generate CSV Content for floor supervisors
        const csvHeaders = ['Employee ID', 'Full Name', 'Department Node', 'Kiosk PIN', 'Status', 'Expires At', 'Kiosk Terminal URL'];
        const csvRows = roster.map((r) => [
            r.employeeId,
            `"${r.fullName.replace(/"/g, '""')}"`,
            r.nodeId,
            r.pin,
            r.isBurned ? 'COMPLETED' : 'PENDING',
            r.expiresAt || '',
            `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}${r.kioskUrl}`,
        ]);
        const csvContent = [csvHeaders.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
        return {
            campaignId,
            campaignTitle: campaign.title,
            surveyId: campaign.surveyId,
            totalGroundWorkers: roster.length,
            burnedCount: roster.filter((r) => r.isBurned).length,
            pendingCount: roster.filter((r) => !r.isBurned).length,
            roster,
            csvContent,
        };
    }
}
exports.GetCampaignKioskRosterUseCase = GetCampaignKioskRosterUseCase;
//# sourceMappingURL=get-campaign-kiosk-roster.use-case.js.map