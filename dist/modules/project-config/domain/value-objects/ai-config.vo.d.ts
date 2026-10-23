export type AiProviderType = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL_VLLM' | 'MOCK';
export interface IAiConfigProps {
    provider: AiProviderType;
    apiKey?: string;
    baseUrl?: string;
    modelName?: string;
    maxTokensPerAnalysis?: number;
    monthlyTokenBudget?: number;
    currentMonthUsage?: number;
    lastTestTimestamp?: Date;
    lastTestStatus?: 'SUCCESS' | 'FAILED';
}
export declare class AiConfig {
    readonly provider: AiProviderType;
    readonly apiKey?: string;
    readonly baseUrl?: string;
    readonly modelName: string;
    readonly maxTokensPerAnalysis: number;
    readonly monthlyTokenBudget: number;
    readonly currentMonthUsage: number;
    readonly lastTestTimestamp?: Date;
    readonly lastTestStatus?: 'SUCCESS' | 'FAILED';
    constructor(props?: Partial<IAiConfigProps>);
    toJSON(): IAiConfigProps;
    toMaskedJSON(): IAiConfigProps;
}
