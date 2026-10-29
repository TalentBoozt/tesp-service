"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SapSuccessFactorsConnector = exports.HrisSyncException = void 0;
class HrisSyncException extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.name = 'HrisSyncException';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HrisSyncException = HrisSyncException;
class SapSuccessFactorsConnector {
    providerName = 'SAP_SUCCESSFACTORS';
    tenantUrl;
    clientId;
    clientSecret;
    apiKey;
    companyId;
    constructor(config) {
        if (!config?.tenantUrl) {
            throw new Error('SAP SuccessFactors tenant URL is required');
        }
        this.tenantUrl = config.tenantUrl.replace(/\/$/, '');
        this.clientId = config.clientId || config.username;
        this.clientSecret = config.clientSecret || config.password;
        this.apiKey = config.apiKey;
        this.companyId = config.companyId;
    }
    getAuthHeader() {
        if (this.apiKey) {
            return this.apiKey.startsWith('Bearer ') ? this.apiKey : `Bearer ${this.apiKey}`;
        }
        if (this.clientId && this.clientSecret) {
            const user = this.companyId ? `${this.clientId}@${this.companyId}` : this.clientId;
            return 'Basic ' + Buffer.from(`${user}:${this.clientSecret}`).toString('base64');
        }
        return '';
    }
    async testConnection() {
        try {
            const url = `${this.tenantUrl}/odata/v2/User?$top=1&$format=json`;
            const headers = { Accept: 'application/json' };
            const auth = this.getAuthHeader();
            if (auth)
                headers['Authorization'] = auth;
            const res = await fetch(url, { method: 'GET', headers });
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async fetchEmployees(since) {
        let selectFields = 'userId,username,firstName,lastName,defaultFullName,email,department,division,location,status';
        let query = `$format=json&$select=${selectFields}`;
        if (since) {
            query += `&$filter=lastModifiedDateTime ge datetimeoffset'${since.toISOString()}'`;
        }
        const url = `${this.tenantUrl}/odata/v2/User?${query}`;
        const headers = { Accept: 'application/json' };
        const auth = this.getAuthHeader();
        if (auth)
            headers['Authorization'] = auth;
        let res;
        try {
            res = await fetch(url, { method: 'GET', headers });
        }
        catch (networkErr) {
            throw new HrisSyncException(`SAP SuccessFactors network connection failed: ${networkErr.message}`, networkErr);
        }
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new HrisSyncException(`SAP SuccessFactors API error (HTTP ${res.status}): ${errText || res.statusText}`);
        }
        try {
            const data = await res.json();
            const rawList = Array.isArray(data?.d?.results)
                ? data.d.results
                : Array.isArray(data?.value)
                    ? data.value
                    : Array.isArray(data)
                        ? data
                        : [];
            return this.mapODataUsersToDomain(rawList);
        }
        catch (parseErr) {
            if (parseErr instanceof HrisSyncException)
                throw parseErr;
            throw new HrisSyncException(`Failed to parse SAP SuccessFactors response payload: ${parseErr.message}`, parseErr);
        }
    }
    mapODataUsersToDomain(rawUsers) {
        return rawUsers
            .filter((u) => u && (u.userId || u.id || u.username || u.email))
            .map((u) => {
            const rawId = String(u.userId || u.personIdExternal || u.id || u.username);
            const employeeId = rawId.startsWith('EMP-') ? rawId : `EMP-${rawId}`;
            const firstName = u.firstName ||
                u.personalInfoNav?.results?.[0]?.firstName ||
                u.personalInfoNav?.firstName ||
                '';
            const lastName = u.lastName ||
                u.personalInfoNav?.results?.[0]?.lastName ||
                u.personalInfoNav?.lastName ||
                '';
            const fullName = u.defaultFullName ||
                u.personalInfoNav?.results?.[0]?.displayName ||
                (firstName && lastName ? `${firstName} ${lastName}`.trim() : '') ||
                u.username ||
                'SAP Employee';
            const email = (u.email ||
                u.emailAddress ||
                u.workEmail ||
                '')
                .toLowerCase()
                .trim();
            const dept = u.department ||
                u.jobInfoNav?.results?.[0]?.department ||
                u.jobInfoNav?.department ||
                'Enterprise';
            const division = u.division ||
                u.jobInfoNav?.results?.[0]?.division ||
                u.jobInfoNav?.division;
            const location = u.location ||
                u.jobInfoNav?.results?.[0]?.location ||
                u.jobInfoNav?.location;
            const rawStatus = (u.status || '').toString().toLowerCase();
            let status = 'ACTIVE';
            if (rawStatus === 'f' || rawStatus.includes('inactive') || rawStatus.includes('term')) {
                status = 'TERMINATED';
            }
            else if (rawStatus.includes('leave')) {
                status = 'ON_LEAVE';
            }
            const nodeId = `NODE-${dept.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
            return {
                employeeId,
                workEmail: email,
                fullName,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                department: dept,
                division: division || undefined,
                location: location || undefined,
                status,
                nodeId,
                attributes: {
                    department: dept,
                    division,
                    location,
                    jobTitle: u.jobTitle || u.title,
                    costCenter: u.costCenter,
                },
            };
        });
    }
}
exports.SapSuccessFactorsConnector = SapSuccessFactorsConnector;
//# sourceMappingURL=sap-successfactors.connector.js.map