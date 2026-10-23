"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiConfig = void 0;
class AiConfig {
    provider;
    apiKey;
    baseUrl;
    modelName;
    maxTokensPerAnalysis;
    monthlyTokenBudget;
    currentMonthUsage;
    lastTestTimestamp;
    lastTestStatus;
    constructor(props) {
        this.provider = props?.provider || 'GEMINI';
        this.apiKey = props?.apiKey;
        this.baseUrl = props?.baseUrl;
        this.modelName = props?.modelName || (this.provider === 'GEMINI' ? 'gemini-1.5-pro' : this.provider === 'OPENAI' ? 'gpt-4o' : this.provider === 'ANTHROPIC' ? 'claude-3-5-sonnet' : 'mock-model');
        this.maxTokensPerAnalysis = props?.maxTokensPerAnalysis || 4000;
        this.monthlyTokenBudget = props?.monthlyTokenBudget || 1000000;
        this.currentMonthUsage = props?.currentMonthUsage || 0;
        this.lastTestTimestamp = props?.lastTestTimestamp;
        this.lastTestStatus = props?.lastTestStatus;
    }
    toJSON() {
        return {
            provider: this.provider,
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            modelName: this.modelName,
            maxTokensPerAnalysis: this.maxTokensPerAnalysis,
            monthlyTokenBudget: this.monthlyTokenBudget,
            currentMonthUsage: this.currentMonthUsage,
            lastTestTimestamp: this.lastTestTimestamp,
            lastTestStatus: this.lastTestStatus,
        };
    }
    toMaskedJSON() {
        return {
            ...this.toJSON(),
            apiKey: this.apiKey ? '••••••••' + this.apiKey.slice(-4) : undefined,
        };
    }
}
exports.AiConfig = AiConfig;
//# sourceMappingURL=ai-config.vo.js.map