import { IHrisConnector } from './hris-connector.interface';
export interface HrisConnectorFactoryOptions {
    provider: 'WORKDAY' | 'BAMBOOHR' | 'SAP_SUCCESSFACTORS' | 'OTHER' | string;
    tenantUrl: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    companyId?: string;
    username?: string;
    password?: string;
}
export declare class HrisConnectorFactory {
    /**
     * Factory method to create an HRIS connector instance by provider name or options object.
     */
    static create(providerOrOptions: string | HrisConnectorFactoryOptions, config?: Partial<HrisConnectorFactoryOptions>): IHrisConnector;
    static createConnector(options: HrisConnectorFactoryOptions): IHrisConnector;
}
