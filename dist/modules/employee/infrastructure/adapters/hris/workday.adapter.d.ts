import { IHrisConnector, NormalizedHrisEmployee } from './hris-connector.interface';
export interface WorkdayConfig {
    tenantUrl: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
}
export declare class WorkdayAdapter implements IHrisConnector {
    readonly providerName = "WORKDAY";
    private tenantUrl;
    private clientId?;
    private clientSecret?;
    constructor(config: WorkdayConfig);
    private getAuthHeader;
    testConnection(): Promise<boolean>;
    fetchEmployees(since?: Date): Promise<NormalizedHrisEmployee[]>;
    fetchAllEmployees(since?: Date): Promise<NormalizedHrisEmployee[]>;
    private normalizeWorkers;
}
