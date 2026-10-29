import { IHrisConnector, NormalizedHrisEmployee } from './hris-connector.interface';
export declare class HrisSyncException extends Error {
    readonly originalError?: any | undefined;
    constructor(message: string, originalError?: any | undefined);
}
export interface SapSuccessFactorsConfig {
    tenantUrl: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    companyId?: string;
    username?: string;
    password?: string;
}
export declare class SapSuccessFactorsConnector implements IHrisConnector {
    readonly providerName = "SAP_SUCCESSFACTORS";
    private tenantUrl;
    private clientId?;
    private clientSecret?;
    private apiKey?;
    private companyId?;
    constructor(config: SapSuccessFactorsConfig);
    private getAuthHeader;
    testConnection(): Promise<boolean>;
    fetchEmployees(since?: Date): Promise<NormalizedHrisEmployee[]>;
    mapODataUsersToDomain(rawUsers: any[]): NormalizedHrisEmployee[];
}
