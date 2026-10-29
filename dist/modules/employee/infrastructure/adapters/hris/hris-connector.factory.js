"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrisConnectorFactory = void 0;
const bamboohr_adapter_1 = require("./bamboohr.adapter");
const workday_adapter_1 = require("./workday.adapter");
const sap_successfactors_connector_1 = require("./sap-successfactors.connector");
class HrisConnectorFactory {
    /**
     * Factory method to create an HRIS connector instance by provider name or options object.
     */
    static create(providerOrOptions, config) {
        if (typeof providerOrOptions === 'string') {
            return HrisConnectorFactory.createConnector({
                provider: providerOrOptions,
                tenantUrl: config?.tenantUrl || 'https://api.successfactors.eu',
                ...config,
            });
        }
        return HrisConnectorFactory.createConnector(providerOrOptions);
    }
    static createConnector(options) {
        const provider = (options.provider || '').toUpperCase();
        if (provider === 'BAMBOOHR') {
            return new bamboohr_adapter_1.BambooHrAdapter({
                tenantUrl: options.tenantUrl,
                apiKey: options.clientSecret || options.apiKey || options.clientId || 'bamboo-key',
            });
        }
        if (provider === 'WORKDAY') {
            return new workday_adapter_1.WorkdayAdapter({
                tenantUrl: options.tenantUrl,
                clientId: options.clientId,
                clientSecret: options.clientSecret,
            });
        }
        if (provider === 'SAP_SUCCESSFACTORS' || provider === 'SAP') {
            return new sap_successfactors_connector_1.SapSuccessFactorsConnector({
                tenantUrl: options.tenantUrl,
                clientId: options.clientId || options.username,
                clientSecret: options.clientSecret || options.password,
                apiKey: options.apiKey,
                companyId: options.companyId,
            });
        }
        throw new Error(`Unsupported HRIS provider: ${options.provider}`);
    }
}
exports.HrisConnectorFactory = HrisConnectorFactory;
//# sourceMappingURL=hris-connector.factory.js.map