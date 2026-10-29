"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BambooHrAdapter = void 0;
class BambooHrAdapter {
    providerName = 'BAMBOOHR';
    subdomain;
    apiKey;
    constructor(config) {
        if (!config.apiKey || config.apiKey.trim().length === 0) {
            throw new Error('BambooHR API key is required');
        }
        this.apiKey = config.apiKey.trim();
        // Extract subdomain from tenantUrl or config.subdomain
        if (config.subdomain) {
            this.subdomain = config.subdomain;
        }
        else if (config.tenantUrl) {
            try {
                const url = new URL(config.tenantUrl.startsWith('http') ? config.tenantUrl : `https://${config.tenantUrl}`);
                const parts = url.hostname.split('.');
                this.subdomain = parts[0] || 'api';
            }
            catch {
                this.subdomain = config.tenantUrl.replace(/[^a-zA-Z0-9_-]/g, '');
            }
        }
        else {
            throw new Error('BambooHR tenant URL or subdomain is required');
        }
    }
    getAuthHeader() {
        return 'Basic ' + Buffer.from(`${this.apiKey}:x`).toString('base64');
    }
    async testConnection() {
        const url = `https://api.bamboohr.com/api/gateway.php/${this.subdomain}/v1/employees/directory`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: this.getAuthHeader(),
            },
        });
        return res.ok;
    }
    async fetchEmployees(since) {
        const url = `https://api.bamboohr.com/api/gateway.php/${this.subdomain}/v1/employees/directory`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: this.getAuthHeader(),
            },
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`BambooHR API returned HTTP ${res.status}: ${errText || res.statusText}`);
        }
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.employees || [];
        return rawList
            .filter((emp) => emp.id || emp.workEmail)
            .map((emp) => {
            const firstName = emp.firstName || '';
            const lastName = emp.lastName || '';
            const fullName = emp.displayName || `${firstName} ${lastName}`.trim() || 'Unknown Employee';
            const empId = String(emp.id || emp.employeeNumber || emp.workEmail);
            const dept = emp.department || 'General';
            return {
                employeeId: empId.startsWith('EMP-') ? empId : `EMP-${empId}`,
                workEmail: (emp.workEmail || '').toLowerCase().trim(),
                firstName,
                lastName,
                fullName,
                department: dept,
                division: emp.division,
                location: emp.location,
                phoneNumber: emp.mobilePhone || emp.workPhone,
                nodeId: `NODE-${dept.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
                status: 'ACTIVE',
                attributes: {
                    department: dept,
                    division: emp.division,
                    location: emp.location,
                    jobTitle: emp.jobTitle,
                },
            };
        });
    }
}
exports.BambooHrAdapter = BambooHrAdapter;
//# sourceMappingURL=bamboohr.adapter.js.map