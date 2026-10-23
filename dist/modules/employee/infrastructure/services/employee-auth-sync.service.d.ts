export interface IEmployeeAuthData {
    projectId: string;
    employeeId?: string;
    email?: string;
    fullName: string;
    phoneNumber?: string;
    status?: string;
}
export interface IProvisionUserResult {
    success: boolean;
    userId: string;
    user?: any;
    isNew: boolean;
    accountProvisioned: boolean;
}
export interface IBulkSyncResult {
    totalProcessed: number;
    provisioned: number;
    updated: number;
    failed: number;
    authAccountsProvisioned: number;
}
export declare class EmployeeAuthSyncService {
    private static instance;
    private hasher;
    constructor(rounds?: number);
    static getInstance(): EmployeeAuthSyncService;
    /**
     * Normalizes incoming raw phone number to trimmed / E.164 standard.
     * e.g., local 0771234567 -> +94771234567, or +94771234567 -> +94771234567
     */
    normalizePhoneNumber(rawPhone?: string): string | undefined;
    /**
     * Provisions or syncs a corresponding UserModel authentication account
     * for a single employee record.
     */
    provisionUserForEmployee(employee: IEmployeeAuthData, temporaryPassword?: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<IProvisionUserResult>;
    /**
     * Bulk syncs UserModel authentication accounts for a large batch of employees.
     * Uses pre-computed password hashes to avoid CPU starvation and batches MongoDB bulkWrite.
     */
    bulkSyncUsersForEmployees(projectId: string, employees: IEmployeeAuthData[], defaultPassword?: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<IBulkSyncResult>;
    /**
     * Deactivates the UserModel account when an employee is terminated.
     */
    deactivateUserForEmployee(projectId: string, employeeId: string): Promise<boolean>;
}
