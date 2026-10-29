export interface NormalizedHrisEmployee {
    employeeId: string;
    workEmail: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    division?: string;
    location?: string;
    phoneNumber?: string;
    managerId?: string;
    nodeId?: string;
    status?: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
    attributes?: Record<string, any>;
}
export interface HrisSyncResult {
    success: boolean;
    fetched: number;
    created: number;
    updated: number;
    failed: number;
    errors?: string[];
    provider: string;
    lastSyncAt: string;
}
export interface IHrisConnector {
    readonly providerName: string;
    testConnection(): Promise<boolean>;
    fetchEmployees(since?: Date): Promise<NormalizedHrisEmployee[]>;
}
export declare class HrisSyncException extends Error {
    readonly originalError?: any | undefined;
    constructor(message: string, originalError?: any | undefined);
}
