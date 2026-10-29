import { IHrisConnector, NormalizedHrisEmployee } from './hris-connector.interface';
export interface BambooHrConfig {
    tenantUrl: string;
    apiKey: string;
    subdomain?: string;
}
export declare class BambooHrAdapter implements IHrisConnector {
    readonly providerName = "BAMBOOHR";
    private subdomain;
    private apiKey;
    constructor(config: BambooHrConfig);
    private getAuthHeader;
    testConnection(): Promise<boolean>;
    fetchEmployees(since?: Date): Promise<NormalizedHrisEmployee[]>;
}
