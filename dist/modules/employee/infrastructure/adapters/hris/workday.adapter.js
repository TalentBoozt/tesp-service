"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkdayAdapter = void 0;
class WorkdayAdapter {
    providerName = 'WORKDAY';
    tenantUrl;
    clientId;
    clientSecret;
    constructor(config) {
        if (!config.tenantUrl) {
            throw new Error('Workday tenant URL is required');
        }
        this.tenantUrl = config.tenantUrl.replace(/\/$/, '');
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
    }
    getAuthHeader() {
        if (this.clientId && this.clientSecret) {
            return 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        }
        return '';
    }
    async testConnection() {
        const url = `${this.tenantUrl}/workers?limit=1`;
        const headers = { Accept: 'application/json' };
        const auth = this.getAuthHeader();
        if (auth)
            headers['Authorization'] = auth;
        const res = await fetch(url, { method: 'GET', headers });
        return res.ok;
    }
    async fetchEmployees(since) {
        return this.fetchAllEmployees(since);
    }
    async fetchAllEmployees(since) {
        const PAGE_SIZE = 200;
        const MAX_PAGES = 500;
        const allEmployees = [];
        let pageToken = undefined;
        let offset = 0;
        let pageCount = 0;
        let hasMore = true;
        while (hasMore && pageCount < MAX_PAGES) {
            pageCount++;
            let queryParams = `limit=${PAGE_SIZE}`;
            if (pageToken) {
                queryParams += `&pageToken=${encodeURIComponent(pageToken)}`;
            }
            else if (offset > 0) {
                queryParams += `&offset=${offset}`;
            }
            if (since) {
                queryParams += `&updated_since=${since.toISOString()}`;
            }
            const url = `${this.tenantUrl}/workers?${queryParams}`;
            const headers = { Accept: 'application/json' };
            const auth = this.getAuthHeader();
            if (auth)
                headers['Authorization'] = auth;
            // Exponential retry backoff on 429/5xx transient failures
            let res = null;
            let attempts = 0;
            const maxAttempts = 3;
            while (attempts < maxAttempts) {
                attempts++;
                try {
                    res = await fetch(url, { method: 'GET', headers });
                    if (res.ok || (res.status !== 429 && res.status < 500)) {
                        break;
                    }
                    if (attempts < maxAttempts) {
                        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 50));
                    }
                }
                catch (networkErr) {
                    if (attempts >= maxAttempts)
                        throw networkErr;
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 50));
                }
            }
            if (!res || !res.ok) {
                const errText = await res?.text().catch(() => '');
                throw new Error(`Workday API returned HTTP ${res?.status || 'UNKNOWN'}: ${errText || res?.statusText}`);
            }
            const data = await res.json();
            const rawList = Array.isArray(data.data)
                ? data.data
                : Array.isArray(data.Report_Entry)
                    ? data.Report_Entry
                    : Array.isArray(data)
                        ? data
                        : [];
            const normalized = this.normalizeWorkers(rawList);
            allEmployees.push(...normalized);
            // Determine next page cursor or offset
            if (data.nextPageToken) {
                pageToken = String(data.nextPageToken);
                hasMore = true;
            }
            else if (data.pageToken && data.pageToken !== pageToken) {
                pageToken = String(data.pageToken);
                hasMore = true;
            }
            else if (data.total !== undefined && typeof data.total === 'number') {
                offset += rawList.length;
                hasMore = offset < data.total && rawList.length > 0;
            }
            else if (rawList.length === PAGE_SIZE) {
                // Fallback offset pagination when page size is full
                offset += rawList.length;
                hasMore = true;
            }
            else {
                hasMore = false;
            }
        }
        return allEmployees;
    }
    normalizeWorkers(rawList) {
        return rawList
            .filter((w) => w.Worker_ID || w.id || w.Primary_Work_Email || w.email)
            .map((w) => {
            const empId = String(w.Worker_ID || w.Employee_ID || w.id);
            const firstName = w.First_Name || w.firstName || '';
            const lastName = w.Last_Name || w.lastName || '';
            const fullName = w.Legal_Name || `${firstName} ${lastName}`.trim() || 'Workday Employee';
            const email = (w.Primary_Work_Email || w.email || '').toLowerCase().trim();
            const dept = w.Supervisory_Organization || w.Department || w.department || 'Enterprise';
            return {
                employeeId: empId.startsWith('EMP-') ? empId : `EMP-${empId}`,
                workEmail: email,
                firstName,
                lastName,
                fullName,
                department: dept,
                location: w.Location || w.location,
                phoneNumber: w.Primary_Phone || w.phone,
                nodeId: `NODE-${dept.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
                status: 'ACTIVE',
                attributes: {
                    department: dept,
                    location: w.Location || w.location,
                    jobTitle: w.Business_Title || w.jobTitle,
                },
            };
        });
    }
}
exports.WorkdayAdapter = WorkdayAdapter;
//# sourceMappingURL=workday.adapter.js.map